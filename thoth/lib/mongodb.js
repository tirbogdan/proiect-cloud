import { MongoClient } from "mongodb";

const uri = process.env.MONGO_DB_CONNECTION_STRING;
const options = {};

let client;
let clientPromise;

if (!uri) {
  throw new Error("MONGO_DB_CONNECTION_STRING is missing");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
