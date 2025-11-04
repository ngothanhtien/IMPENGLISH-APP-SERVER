import { likePostController } from "../controllers/like-post.controller";
import express from "express";

const router = express.Router();

router.post("/toggle-like", likePostController.toggleLike);
router.get("/check-like", likePostController.checkUserLiked);
router.get("/post/:postId/likes", likePostController.getLikesByPostId);
router.get("/all-likes", likePostController.getAllLikes);
router.get("/user/:userId/likes", likePostController.getLikesByUserId);

export const likePostRouter = router;