import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

import clientPromise from "../../../lib/mongodb";
import { getQuizAttemptCollection } from "../../../models";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { id } = req.query;
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized." });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thoth");
    const quizAttempts = getQuizAttemptCollection(db);

    const quiz = await quizAttempts.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(payload.userId),
    });

    if (!quiz) {
      return res.status(404).json({ error: "The quiz was not found." });
    }

    res.status(200).json({
      id: quiz._id.toString(),
      date: quiz.date,
      questions: quiz.questions.map((quiz, answerIndex) => ({
        question: quiz.question,
        answers: quiz.answers,
        correctIndex: quiz.correctIndex,
        userAnswerIndex: quiz.userAnswers[answerIndex],
      })),
      score: quiz.score,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "There was an error trying to load the quiz." });
  }
}
