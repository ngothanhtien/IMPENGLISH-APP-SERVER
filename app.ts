import  express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from "./src/configs/dbConnection";
import {httpHandler} from "./src/middlewares/http.middleware"
import {userRouter} from "./src/routes/user.route"
import {vocabularyRouter} from "./src/routes/vocabulary.route"
import {authRouter} from "./src/routes/auth.route"
import {quizRouter} from './src/routes/quiz.route'
import {postRouter} from './src/routes/post.route'
import {commentRouter} from './src/routes/comment.route'
import {likePostRouter} from './src/routes/like-post.route'
import morgan from 'morgan'
dotenv.config();

const app = express();

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

connectDB();

app.use("/api/vocabulary",vocabularyRouter)
app.use("/api/users",userRouter);
app.use("/api/auth",authRouter);
app.use("/api/quiz",quizRouter)
app.use("/api/posts",postRouter);
app.use("/api/comments",commentRouter);
app.use("/api/likes",likePostRouter);
app.use(httpHandler);
export default app;