import asynchandler from 'express-async-handler'
import { quizResultService } from '../services/quiz-result.service'
import { IQuizzResultConstant } from '../constants/quiz-result.constant';
import { HttpStatus } from '../constants/http.constant';
import { get } from 'mongoose';
import { User } from '../models/user.model';
export const quizResultController = {
    createQuizResult: asynchandler(async (req, res) => {
        const userId = req.params.userId;
        const userExisting = await User.findById(userId);
        if(!userExisting){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("User does not exist");
        }

        const quizResultData: IQuizzResultConstant = req.body;
        quizResultData.userId = userId;
        
        if(!quizResultData.level || !quizResultData.category || quizResultData.totalQuestions === undefined || quizResultData.correctAnswers === undefined){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Missing required fields: level, category, totalQuestions, correctAnswers");
        }

        if(quizResultData.totalQuestions < 0 || quizResultData.correctAnswers < 0){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("totalQuestions and correctAnswers must be non-negative numbers");
        }

        if(quizResultData.correctAnswers > quizResultData.totalQuestions){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("correctAnswers cannot be greater than totalQuestions");
        }

        if(quizResultData.questions){
            for(const question of quizResultData.questions){
                if(!question.questionId || !question.selectedAnswer || !question.correctAnswer || question.isCorrect === undefined || question.questionText === undefined){
                    res.status(HttpStatus.BAD_REQUEST);
                    throw new Error("Each question must have questionId, selectedAnswer, correctAnswer, and isCorrect fields");
                }
            }
        }

        if(quizResultData.incorrectAnswers === undefined){
            quizResultData.incorrectAnswers = quizResultData.totalQuestions - quizResultData.correctAnswers;
        }

        if(quizResultData.incorrectAnswers < 0){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("incorrectAnswers must be a non-negative number");
        }

        const result = await quizResultService.createQuizResult(quizResultData);

        if (!result) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error("Create quiz result failed due to internal error");
        }

        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "New quiz result created successfully",
            data: result,
        });
    }),

    getQuizResultsByUserId: asynchandler(async (req, res) => {
        const userId = req.params.userId;
        if(!userId){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Missing required field: userId");
        }
        const results = await quizResultService.getQuizResultsByUserId(userId);
        if (!results) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error("Get quiz results failed due to internal error");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Get quiz results by userId successfully",
            total: results.length,
            data: results,
        });
    }),

    getQuizResultById: asynchandler(async (req, res) => {
        const quizResultId =  req.params.quizResultId;
        if(!quizResultId){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Missing required field: quizResultId");
        }
        const result = await quizResultService.getQuizResultById(quizResultId);
        if (!result) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error("Get quiz result failed due to internal error");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Get quiz result by id successfully",
            data: result,
        });
    }),

    updateQuizResult: asynchandler(async (req, res) => {
        const quizResultId = req.params.quizResultId;
        if(!quizResultId){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Missing required field: quizResultId");
        }
        const updateData: Partial<IQuizzResultConstant> = req.body;
        const updatedResult = await quizResultService.updateQuizResult(quizResultId, updateData);
        if (!updatedResult) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error("Update quiz result failed due to internal error");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Quiz result updated successfully",
            data: updatedResult,
        });
    }),

    deleteQuizResult: asynchandler(async (req, res) => {
        const quizResultId = req.params.quizResultId;
        if(!quizResultId){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Missing required field: quizResultId");
        }
        const isDeleted = await quizResultService.deleteQuizResult(quizResultId);
        if (!isDeleted) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error("Delete quiz result failed due to internal error");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Quiz result deleted successfully",
        });
    }),

    getAllQuizResults: asynchandler(async (req, res) => {
        const results = await quizResultService.getAllQuizResults();
        if (!results) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error("Get all quiz results failed due to internal error");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Get all quiz results successfully",
            total: results.length,
            data: results,
        });
    }),

    deleteAllQuizResults: asynchandler(async (req, res) => {
        const isDeleted = await quizResultService.deleteAllQuizResults();
        if (!isDeleted) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error("Delete all quiz results failed due to internal error");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "All quiz results deleted successfully",
        });
    }),

    deleteQuizResultsByUserId: asynchandler(async (req,res) => {
        const userId = req.params.userId;
        const quizResultId = req.body.quizResultId;

        if(!userId || !quizResultId){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Missing required fields: userId, quizResultId");
        }

        const existingUser = await User.findById(userId);
        if(!existingUser){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("User does not exist");
        }

        const existingQuizResult = await quizResultService.getQuizResultById(quizResultId);
        if(!existingQuizResult){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Quiz result does not exist");
        }
        const isDeleted = await quizResultService.deleteQuizResultsByUserId(userId, quizResultId);
        if (!isDeleted) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error("Delete quiz results by userId failed due to internal error");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Quiz results by userId deleted successfully",
        });
    })
}