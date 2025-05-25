import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

import clientPromise from "../../lib/mongodb";
import { getQuizAttemptCollection, getUsersCollection } from "../../models";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "Unathenticated." });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    const { quizId, userAnswers } = req.body;

    if (!quizId || !Array.isArray(userAnswers)) {
      return res.status(400).json({ error: "Invalid data." });
    }

    const client = await clientPromise;
    const db = client.db("thoth");

    const quizAttempts = getQuizAttemptCollection(db);
    const users = getUsersCollection(db);

    const quizAttempt = await quizAttempts.findOne({
      _id: new ObjectId(quizId),
      userId: new ObjectId(payload.userId),
    });

    if (!quizAttempt) {
      return res.status(404).json({ error: "The quiz was not found" });
    }

    if (quizAttempt.score !== null) {
      return res.status(400).json({ error: "The quiz was already completed" });
    }

    const { questions } = quizAttempt;

    if (questions.length !== userAnswers.length) {
      return res.status(400).json({ error: "Invalid answer numbers." });
    }

    let score = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctIndex) {
        score += 1;
      }
    });

    await quizAttempts.updateOne(
      { _id: new ObjectId(quizId) },
      { $set: { userAnswers, score } }
    );

    await users.updateOne(
      { _id: new ObjectId(payload.userId) },
      {
        $inc: { wisdomPoints: score },
        $push: { history: new ObjectId(quizId) },
      }
    );

    res
      .status(200)
      .json({ message: "The quiz was completed succesfully.", score });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "There was an error trying to submit the quiz." });
  }
}
