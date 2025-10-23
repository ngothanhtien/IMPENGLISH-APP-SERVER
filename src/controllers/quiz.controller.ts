import asynchandler from 'express-async-handler'
import { Request,Response } from 'express'
import { HttpStatus } from '../constants/http.constant';
import { quizService } from '../services/quiz.service';
import { IQuizFilter } from '../constants/quiz.constant';
import { IQuiz } from '../models/quiz.model';
export const quizController = {
    createQuiz: asynchandler(async(req: Request, res: Response) => {
        const {topic,question} = req.body;
        
        if (!topic || !question || !Array.isArray(question) || question.length === 0) {
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Invalid quiz data: topic and question are required");
        }

        const result  = await quizService.createQuiz({ topic, question } as IQuiz);

        if (!result) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error("Create quiz failed due to internal error");
        }

        if("message" in result && result.message){
            res.status(HttpStatus.OK).json({
                status: "Success",
                message: result.message,
                data: result.quiz || null,
            });
        }

        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "New quiz created successfully",
            data: result,
        });
    }),

    getQuizAllOrByFilter: asynchandler(async(req: Request, res: Response) => {
        const filter: IQuizFilter = {
            topic: req.query.topic as string,
            level: req.query.level as "Easy" | "Medium" | "Hard" || '',
            limit: req.query.limit ? parseInt(req.query.limit as string) : 5,
            skip: req.query.skip ? parseInt(req.query.skip as string) : 0,
            sortBy: req.query.sortBy as string || 'createdAt',
            sortOrder: req.query.sortOrder as "asc" | "desc" || "asc",
        };
        const quizs = await quizService.getQuizByFilter(filter);

        if(!quizs){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Get quiz by topic not successfully. Please check filter again!");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Get quiz by filter successfully",
            data: quizs
        })
    }),

    getQuestionById: asynchandler(async(req: Request, res: Response) => {
        const questionId = req.params.id;
        if(!questionId){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Please enter questionId that get detail!.")
        }
        const existsQuestion = await quizService.getQuestionById(questionId);

        if(!existsQuestion){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error(`Can't not get question with: ${questionId}. Please change questionId`);;
        }

        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Get question by id successfully!",
            data: existsQuestion
        })
    }),

    deleteQuestion: asynchandler(async(req: Request, res: Response) => {
        const questionId = req.params.id;
        if(!questionId){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Please enter questionId that delete question!.")
        } 
        const result = await quizService.deleteQuestion(questionId);
        if(!result){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error(`Can't not delete question with: ${questionId}. Please change questionId`);;
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Delete question successfully",
        })
    }),

    deleteQuiz: asynchandler(async(req: Request, res: Response) => {
        const quizId = req.params.id;
        if(!quizId){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Please enter quizId that delete quiz list!.")
        } 
        const result = await quizService.deleteQuiz(quizId);
        if(!result){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error(`Can't not delete quiz with: ${quizId}. Please change quizId`);;
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Delete quiz list successfully",
        })
    })
} 