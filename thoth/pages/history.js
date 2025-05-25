import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { withAuth } from "../lib/withAuth";

export const getServerSideProps = withAuth();

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchHistory() {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
      setLoading(false);
    }
    fetchHistory();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/auth");
    } catch (err) {
      console.error("Failed to log-out:", err);
    }
  }

  if (loading)
    return (
      <div className="quiz-container history-wrapper">
        <p>The history is loading...</p>
      </div>
    );

  if (!history.length)
    return (
      <div className="quiz-container history-wrapper">
        <h2>Quiz history</h2>
        <p>You have no quized finished yet.</p>
        <div className="history-buttons">
          <button className="submit-button" onClick={() => router.push("/")}>
            Start a new quiz
          </button>
          <button
            className="submit-button"
            onClick={() => router.push("/leaderboard")}
          >
            Leaderboard
          </button>
        </div>
      </div>
    );

  return (
    <div className="quiz-container history-wrapper">
      <h2>Istoricul testelor</h2>
      <div className="history-buttons">
        <button className="submit-button" onClick={() => router.push("/")}>
          Start a new quiz
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
      <div className="history-container">
        <ul className="history-list">
          {history.map((quiz) => (
            <li key={quiz.id} className="history-item">
              <div className="history-info">
                <p className="history-date">
                  {new Date(quiz.createdAt).toLocaleString()}
                </p>
                <p className="history-question">{quiz.firstQuestion}</p>
                <p className="history-score">Wisdom points: {quiz.score}</p>
              </div>
              <button
                className="submit-button history-view-button"
                onClick={() => router.push(`/history/${quiz.id}`)}
              >
                See the quiz
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
