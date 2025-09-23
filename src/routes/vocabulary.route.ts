import  express  from "express";
import { vocabularyController } from "../controllers/vocabulary.controller";

const router = express.Router();

router.get("/topic/:topic",vocabularyController.findByTopic);
router.get("/vocab-all",vocabularyController.getAllVocabulary);
router.get("/flashCard",vocabularyController.getFlashCards);
router.get("/flashCard/:topic",vocabularyController.getFlashCardsByTopic);
router.get("/randomword",vocabularyController.getRandomWords);
router.get("/findWordWithMeanings",vocabularyController.findWordsWithMultipleMeanings);
router.get("/search",vocabularyController.findWordsWithMultipleMeanings);
export const vocabularyRouter = router;