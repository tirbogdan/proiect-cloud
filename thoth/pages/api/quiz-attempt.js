import clientPromise from "../../lib/mongodb";
import { getQuizAttemptCollection } from "../../models/QuizAttempt";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, questions, userAnswers, score } = req.body;

  if (!userId || !questions || !userAnswers || score == null) {
    return res.status(400).json({ error: "Incomplete data" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thoth");
    const quizAttempts = getQuizAttemptCollection(db);

    const attempt = {
      userId,
      date: new Date(),
      questions,
      userAnswers,
      score,
    };

    const result = await quizAttempts.insertOne(attempt);
    res
      .status(200)
      .json({ message: "The quiz was saved.", id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Failed to save the quiz." });
  }
}
