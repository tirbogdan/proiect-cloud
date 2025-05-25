import jwt from "jsonwebtoken";

import clientPromise from "../../lib/mongodb";
import { getUsersCollection } from "../../models";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unathorized." });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thoth");
    const users = getUsersCollection(db);

    const cursor = users
      .find({}, { projection: { username: 1, wisdomPoints: 1 } })
      .sort({ wisdomPoints: -1 });

    const results = await cursor.toArray();

    const leaderboard = results.map((u) => ({
      username: u.username,
      wisdomPoints: u.wisdomPoints,
    }));

    res.status(200).json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load the leaderboard" });
  }
}
