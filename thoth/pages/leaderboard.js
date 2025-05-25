import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { withAuth } from "../lib/withAuth";

export const getServerSideProps = withAuth();

export default function Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard");
        if (!res.ok) throw new Error("Failed to load the leaderboard.");
        const data = await res.json();
        setList(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

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
        <p>The leaderboard is loading...</p>
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

  return (
    <div className="quiz-container">
      <h2 className="quiz-title">Global leaderboard</h2>
      <ul className="leaderboard-list">
        {list.map((user, index) => (
          <li key={index} className="leaderboard-item">
            <span className="rank">{index + 1}.</span>
            <span className="username">{user.username}</span>
            <span className="points">{user.wisdomPoints}</span>
          </li>
        ))}
      </ul>
      <div className="button-group">
        <button className="submit-button" onClick={() => router.push("/")}>
          Start a new quiz
        </button>
        <button
          className="submit-button"
          onClick={() => router.push("/history")}
          style={{ marginLeft: "10px" }}
        >
          Quiz history
        </button>
        <button onClick={handleLogout} className="submit-button">
          Logout
        </button>
      </div>
    </div>
  );
}
