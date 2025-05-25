import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import clientPromise from "../../lib/mongodb";
import { getUsersCollection } from "../../models";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: "One or more fields is missing" });
  }

  const client = await clientPromise;
  const db = client.db("thoth");
  const users = getUsersCollection(db);

  const existingUser = await users.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return res
      .status(400)
      .json({ error: "The email or username is already used" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await users.insertOne({
    email,
    username,
    password: hashedPassword,
    createdAt: new Date(),
    wisdomPoints: 0,
    history: [],
  });

  const token = jwt.sign(
    { userId: result.insertedId, email },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  res.setHeader(
    "Set-Cookie",
    `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`
  );
  res.status(201).json({ message: "The account was succesfully created." });
}
