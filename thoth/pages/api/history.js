import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

import clientPromise from "../../lib/mongodb";
import { getQuizAttemptCollection } from "../../models";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unathorized." });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thoth");
    const quizAttempts = getQuizAttemptCollection(db);

    const quizzesCursor = quizAttempts
      .find({ userId: new ObjectId(payload.userId) })
      .project({
        _id: 1,
        date: 1,
        score: 1,
        "questions.question": 1,
      })
      .sort({ date: -1 });

    const results = await quizzesCursor.toArray();

    const formatted = results.map((q) => ({
      id: q._id.toString(),
      createdAt: q.date,
      score: q.score,
      firstQuestion: q.questions[0]?.question,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load the history" });
  }
}
