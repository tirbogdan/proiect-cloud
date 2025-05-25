export function getQuizAttemptCollection(db) {
  return db.collection("quizAttempts");
}

export const quizAttemptSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "date", "questions", "userAnswers", "score"],
      properties: {
        userId: { bsonType: "objectId" },
        date: { bsonType: "date" },
        questions: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["question", "answers", "correctIndex"],
            properties: {
              question: { bsonType: "string" },
              answers: {
                bsonType: "array",
                items: { bsonType: "string" },
              },
              correctIndex: { bsonType: "int" },
            },
          },
        },
        userAnswers: {
          bsonType: "array",
          items: { bsonType: "int" },
        },
        score: { bsonType: "int" },
      },
    },
  },
};
