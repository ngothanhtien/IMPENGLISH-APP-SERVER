import  express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from "./src/configs/dbConnection";
import {httpHandler} from "./src/middlewares/http.middleware"
import {userRouter} from "./src/routes/user.route"
import {vocabularyRouter} from "./src/routes/vocabulary.route"
import {authRouter} from "./src/routes/auth.route"
dotenv.config();

const app = express();

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());

connectDB();

app.get("/",(req,res) => {
    res.send("Hello my app")
});
app.use("/api/vocabulary",vocabularyRouter)
app.use("/api/users",userRouter);
app.use("/api/auth",authRouter);

app.use(httpHandler);
export default app;