import express from "express";
import { quizResultController } from "../controllers/quiz-result.controller";

const router = express.Router();

router.post("/create/:userId", quizResultController.createQuizResult);
router.get("/user/:userId", quizResultController.getQuizResultsByUserId);
router.get("/detail/:quizResultId", quizResultController.getQuizResultById);
router.put("/update/:quizResultId", quizResultController.updateQuizResult);
router.delete("/delete/:quizResultId", quizResultController.deleteQuizResult);
router.delete("/deleteAll", quizResultController.deleteAllQuizResults);
router.delete("/delete/user/:userId", quizResultController.deleteQuizResultsByUserId);
router.get("/", quizResultController.getAllQuizResults);
export const quizResultRouter = router;