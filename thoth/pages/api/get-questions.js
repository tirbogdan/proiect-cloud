import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

import clientPromise from "../../lib/mongodb";
import { getQuizAttemptCollection } from "../../models";

const OPEN_TDB_URL =
  "https://opentdb.com/api.php?amount=25&type=multiple&encode=url3986";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "Unathenticated." });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const response = await fetch(OPEN_TDB_URL);
    const data = await response.json();

    if (data.response_code === 5) throw "API rate-limit";

    const questions = data.results.map((question) => {
      const answers = [
        decodeURIComponent(question.correct_answer),
        ...question.incorrect_answers.map((a) => decodeURIComponent(a)),
      ];

      const shuffledAnswers = answers
        .map((a) => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value);

      const correctIndex = shuffledAnswers.findIndex(
        (ans) => ans === decodeURIComponent(question.correct_answer)
      );

      return {
        question: decodeURIComponent(question.question),
        answers: shuffledAnswers,
        correctIndex,
      };
    });

    const client = await clientPromise;
    const db = client.db("thoth");
    const quizAttempts = getQuizAttemptCollection(db);

    const quizAttemptDoc = {
      userId: new ObjectId(payload.userId),
      date: new Date(),
      questions,
      userAnswers: [],
      score: null,
    };

    const result = await quizAttempts.insertOne(quizAttemptDoc);

    const questionsForClient = questions.map(({ question, answers }) => ({
      question,
      answers,
    }));

    res
      .status(200)
      .json({ quizId: result.insertedId, questions: questionsForClient });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "There was an error trying to get the questions." });
  }
}
