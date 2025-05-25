export function getUsersCollection(db) {
  return db.collection("users");
}

export const userSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password", "wisdomPoints", "history"],
      properties: {
        username: { bsonType: "string" },
        email: { bsonType: "string" },
        password: { bsonType: "string" },
        wisdomPoints: { bsonType: "int" },
        history: {
          bsonType: "array",
          items: { bsonType: "objectId" },
        },
      },
    },
  },
};
