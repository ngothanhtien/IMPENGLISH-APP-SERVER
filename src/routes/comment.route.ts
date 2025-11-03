import  express  from "express";
import { commentController } from "../controllers/comment.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/create/:id",commentController.addComment);
router.get("/:postId",commentController.getCommentsByPostId);
router.delete("/delete/:commentId",commentController.deleteComment);
router.put("/like/:commentId",commentController.addLikeToComment);
router.put("/update/:commentId",commentController.updateComment);
export const commentRouter = router;