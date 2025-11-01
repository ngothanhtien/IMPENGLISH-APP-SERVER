import  express  from "express";
import { postController } from "../controllers/post.controller"; 
import { requireAuth } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/create/:id",postController.createPost);
router.get("/",postController.getAllPosts);
router.get("/user/:id",postController.getPostsByUserId);
router.get("/detail/:postId",postController.getPostById);
router.get("/category",postController.getPostsByCategory);
router.put("/update/:postId",postController.updatePost);
router.delete("/delete/:postId",postController.deletePost);
export const postRouter = router;