import { IQuizzResultConstant } from "../constants/quiz-result.constant";
import { IQuizzResult, QuizzResult } from "../models/quiz_result.model";

export const quizResultService = {
    createQuizResult: async (quizResultData: IQuizzResultConstant): Promise<IQuizzResultConstant | null> => {
        try {
            const newQuizResult = new QuizzResult(quizResultData);
            const savedQuizResult = (await newQuizResult.save()).populate("userId", "fullName streakDay level avatar");
            return savedQuizResult;
        } catch (error) {
            console.error("Error creating quiz result:", error);
            return null;
        }
    },

    getQuizResultsByUserId: async (userId: string): Promise<IQuizzResultConstant[] | null> => {
        try {
            const quizResults = await QuizzResult.find({ userId });
            return quizResults;
        } catch (error) {
            console.error("Error fetching quiz results by userId:", error);
            return null;
        }
    },
    getQuizResultById: async (quizResultId: string): Promise<IQuizzResultConstant | null> => {
        try {
            const quizResult = await QuizzResult.findById(quizResultId).populate("userId", "fullName streakDay level avatar");
            return quizResult;
        }
        catch (error) {
            console.error("Error fetching quiz result by id:", error);
            return null;
        }
    },

    updateQuizResult: async (quizResultId: string, updateData: Partial<IQuizzResultConstant>): Promise<IQuizzResultConstant | null> => {
        try {
            const updatedQuizResult = await QuizzResult.findByIdAndUpdate(
                quizResultId,
                { $set: updateData},
                { new: true }
            );
            return updatedQuizResult;
        } catch (error) {
            console.error("Error updating quiz result:", error);
            return null;
        }
    },

    deleteQuizResult: async (quizResultId: string): Promise<boolean> => {
        try {
            await QuizzResult.findByIdAndDelete(quizResultId);
            return true;
        } catch (error) {
            console.error("Error deleting quiz result:", error);
            return false;
        }
    },

    getAllQuizResults: async (): Promise<IQuizzResult[] | null> => {
        try {
            const quizResults = await QuizzResult.find().select("-questions -createdAt -updatedAt -__v").populate("userId", "fullName streakDay level");
            return quizResults;
        } catch (error) {
            console.error("Error fetching all quiz results:", error);
            return null;
        }
    },

    deleteAllQuizResults: async (): Promise<boolean> => {
        try {
            await QuizzResult.deleteMany({});
            return true;
        } catch (error) {
            console.error("Error deleting all quiz results:", error);
            return false;
        }
    },
    
    deleteQuizResultsByUserId: async (userId: string,quizResultId: string): Promise<boolean> => {
        try {
            const result = await QuizzResult.deleteOne({
                _id: quizResultId,
                userId: userId
            });
            return result.deletedCount === 1;
        } catch (error) {
            console.error("Error deleting quiz results by userId:", error);
            return false;
        }
    },
    
}