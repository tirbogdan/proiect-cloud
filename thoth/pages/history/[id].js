import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { withAuth } from "../../lib/withAuth";

export const getServerSideProps = withAuth();

export default function QuizDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchQuizDetails() {
      try {
        const res = await fetch(`/api/history/${id}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/auth");
            return;
          }
          throw new Error("The quiz was not found.");
        }
        const data = await res.json();
        setQuiz(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizDetails();
  }, [id, router]);

  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/auth");
    } catch (err) {
      console.error("Failed to log-out:", err);
    }
  }

  if (loading) {
    return (
      <div className="quiz-container">
        <p>The quiz is loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container error-message">
        <p>{error}</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-container">
        <p>The quiz was not found.</p>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">
        Quiz from {new Date(quiz.date).toLocaleString()}
      </h2>
      <p className="quiz-score">Wisdom points: {quiz.score}</p>
      <div className="questions-wrapper">
        <ul className="question-list">
          {quiz.questions.map((q, idx) => {
            return (
              <li key={idx} className="question-item">
                <p className="question-text">
                  Question {idx + 1}: {q.question}
                </p>
                <ul className="answer-list">
                  {q.answers.map((answer, i) => {
                    const isCorrect = i === q.correctIndex;
                    const isChosen = i === q.userAnswerIndex;
                    return (
                      <li
                        key={i}
                        className={`answer-item ${isCorrect ? "correct" : ""} ${
                          isChosen && !isCorrect ? "chosen" : ""
                        }`}
                      >
                        {answer}
                        {isCorrect && <span className="correct-mark">✓</span>}
                        {isChosen && !isCorrect && (
                          <span className="wrong-mark">✗</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="button-group">
        <button
          className="submit-button"
          onClick={() => router.push("/history")}
        >
          Back to history
        </button>
        <button className="submit-button" onClick={() => router.push("/")}>
          New quiz
        </button>
        <button onClick={handleLogout} className="submit-button">
          Logout
        </button>
      </div>
    </div>
  );
}
