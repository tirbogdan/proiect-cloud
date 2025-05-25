import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import clientPromise from "../../lib/mongodb";
import { getUsersCollection } from "../../models";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  const client = await clientPromise;
  const db = client.db("thoth");
  const users = getUsersCollection(db);

  const user = await users.findOne({ email });

  if (!user) {
    return res.status(401).json({ error: "Invalid mail or password." });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid mail or password" });
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  res.setHeader(
    "Set-Cookie",
    `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`
  );
  res.status(200).json({ message: "Succesfully authenticated" });
}
