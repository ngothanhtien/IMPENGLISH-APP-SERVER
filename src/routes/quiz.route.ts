import  express  from "express";
import { quizController } from "../controllers/quiz.controller";
import { validateQuiz } from "../validations/quiz.validation";

const router = express.Router();

router.get("/",quizController.getQuizAllOrByFilter);
router.get("/question/:id",quizController.getQuestionById);
router.delete("/:id",quizController.deleteQuiz);
router.delete("/question/:id",quizController.deleteQuestion);
router.post("/",validateQuiz,quizController.createQuiz);
export const quizRouter = router;