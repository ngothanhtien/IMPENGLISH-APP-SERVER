import { Request, Response, NextFunction } from "express";

// enum topics giống với model
const allowedTopics = [
  "Technology",
  "Business",
  "Education",
  "Sports",
  "Entertainment",
  "Science",
  "History",
  "Conversation"
];
const allowedLevel = ["Easy", "Medium", "Hard"];

export const validateQuiz = (req: Request, res: Response, next: NextFunction) => {
  const { topic, question } = req.body;

  // Check topic
  if (!topic || !allowedTopics.includes(topic)) {
    return res.status(400).json({ message: "Invalid or missing topic" });
  }

  // Check question array
  if (!Array.isArray(question) || question.length === 0) {
    return res.status(400).json({ message: "Questions must be a non-empty array" });
  }

  for (let i = 0; i < question.length; i++) {
    const q = question[i];

    if (!q.questionText || typeof q.questionText !== "string") {
      return res.status(400).json({ message: `Question ${i + 1}: missing or invalid questionText` });
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      return res.status(400).json({ message: `Question ${i + 1}: must have at least 2 options` });
    }

    if (!q.correctAnswer || typeof q.correctAnswer !== "string") {
      return res.status(400).json({ message: `Question ${i + 1}: missing correctAnswer` });
    }

    // optional: kiểm tra correctAnswer có nằm trong options
    if (!q.options.includes(q.correctAnswer)) {
      return res.status(400).json({ message: `Question ${i + 1}: correctAnswer must be one of the options` });
    }

    if (!allowedLevel.includes(q.level)){
        return res.status(400).json({ message: `Question ${i + 1}: missing or invalid level` });
    }
  }

  // Nếu qua được hết => next()
  next();
};
