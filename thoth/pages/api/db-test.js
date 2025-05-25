import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("thoth");
    const collections = await db.listCollections().toArray();

    res.status(200).json({ status: "The DB connection succeded", collections });
  } catch (e) {
    res
      .status(500)
      .json({ error: "The DB connection failed", details: e.message });
  }
}
