import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { withAuth } from "../lib/withAuth";

export const getServerSideProps = withAuth();

export default function Quiz() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedQuiz = localStorage.getItem("quizData");
    const savedProgress = localStorage.getItem("quizProgress");

    if (savedQuiz) {
      try {
        const { quizId, questions } = JSON.parse(savedQuiz);
        setQuizId(quizId);
        setQuestions(questions);
        if (savedProgress) {
          const { currentIndex, userAnswers } = JSON.parse(savedProgress);
          setCurrentIndex(currentIndex || 0);
          setUserAnswers(userAnswers || []);
        }
        setLoading(false);
        return;
      } catch (err) {
        console.error("Failed to load the saved quiz:", err);
        localStorage.removeItem("quizData");
        localStorage.removeItem("quizProgress");
      }
    }

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (quizId && questions.length > 0) {
      localStorage.setItem(
        "quizProgress",
        JSON.stringify({ currentIndex, userAnswers })
      );
    }
  }, [currentIndex, userAnswers, quizId, questions]);

  useEffect(() => {
    if (score !== null) {
      localStorage.removeItem("quizData");
      localStorage.removeItem("quizProgress");
    }
  }, [score]);

  async function fetchQuestions() {
    try {
      const res = await fetch("/api/get-questions");
      if (!res.ok) {
        throw new Error("Failed to load the questions.");
      }
      const data = await res.json();
      setQuizId(data.quizId);
      setQuestions(data.questions);
      setLoading(false);

      localStorage.setItem(
        "quizData",
        JSON.stringify({ quizId: data.quizId, questions: data.questions })
      );
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/auth");
    } catch (err) {
      console.error("Failed to log-out:", err);
    }
  }

  function handleAnswer(selectedIndex) {
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentIndex] = selectedIndex;
    setUserAnswers(newUserAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitQuiz(newUserAnswers);
    }
  }

  async function submitQuiz(answers) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, userAnswers: answers }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit the answers.");
      }

      const data = await res.json();
      setScore(data.score);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <div className="quiz-container">
        <p>The questions are loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="quiz-container error-message">
        <p>{error}</p>
      </div>
    );

  if (score !== null)
    return (
      <div className="quiz-container">
        <h2>
          Your score: {score} / {questions.length}
        </h2>
        <button className="submit-button" onClick={() => router.push("/")}>
          Start a new quiz
        </button>
        <button
          className="submit-button"
          onClick={() => router.push("/history")}
        >
          Quiz history
        </button>
        <button
          className="submit-button"
          onClick={() => router.push("/leaderboard")}
        >
          Leaderboard
        </button>
        <button onClick={handleLogout} className="submit-button">
          Logout
        </button>
      </div>
    );

  const currentQuestion = questions[currentIndex];

  return (
    <div className="quiz-container" style={{ textAlign: "left" }}>
      <h2>
        Question {currentIndex + 1} / {questions.length}
      </h2>
      <p style={{ margin: "20px 0", fontSize: "1.25rem" }}>
        {currentQuestion.question}
      </p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {currentQuestion.answers.map((answer, i) => (
          <li key={i} style={{ marginBottom: "12px" }}>
            <button
              className="submit-button"
              onClick={() => handleAnswer(i)}
              disabled={submitting}
              style={{ width: "100%" }}
            >
              {answer}
            </button>
          </li>
        ))}
      </ul>
      {submitting && <p>Sending the answers...</p>}
    </div>
  );
}
