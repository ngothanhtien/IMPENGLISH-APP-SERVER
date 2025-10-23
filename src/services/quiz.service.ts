import { IQuizFilter } from "../constants/quiz.constant";
import { IQuestion, IQuiz, Quiz} from "../models/quiz.model"

export const quizService = {
    createQuiz: async (quizData: IQuiz) => {
        try {
            const existingQuiz  = await Quiz.findOne({topic: quizData.topic});

            if(existingQuiz ){

                const newQuestions =  quizData.question.filter(
                    (newQ) => {
                        const isDuplicate = existingQuiz.question.some(
                            (existingQ) => 
                                existingQ.questionText.trim().toLowerCase() ===
                                newQ.questionText.trim().toLowerCase()
                        );
                        return !isDuplicate;
                    }
                );

                if (newQuestions.length === 0) {
                    return { message: "All questions already exist in this topic" };
                }

                existingQuiz.question.push(...newQuestions);
                await existingQuiz.save();
                return {
                    message: `Added ${newQuestions.length} new question(s) to existing topic`,
                    quiz: existingQuiz,
                };
            }else{
                const newQuiz = new Quiz(quizData);
                await newQuiz.save();

                return { message: "New topic created", quiz: newQuiz };
            }
        } catch (error) {
            console.log("Error at create quiz:", error);
            return false;
        }
    },

    getQuizByFilter: async(options: IQuizFilter) => {
        try {
            const{topic, level, limit = 5 ,skip = 0, sortBy='createdAt', sortOrder = 'asc'} = options;
            const query: any ={};

            if(topic){
                query.topic = topic;
            }
            
            if(level){
                query["question.level"] = level;
            }
            
            const data = await Quiz.aggregate([
                { $match: query },
                {
                $project: {
                    topic: 1,
                    question: {
                        $filter: {
                            input: "$question",
                            as: "q",
                            cond: level ? { $eq: ["$$q.level", level] } : {} // lọc theo level nếu có
                        }
                    },
                    createdAt: 1,
                    }
                },
                {
                $project: {
                    topic: 1,
                    createdAt: 1,
                    question: { $slice: ["$question", limit] }
                    }
                },
                { $skip: skip },
                { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } }
            ]);
            return data;
        } catch (error) {
            console.log("Error at get quiz by topic: ",error);
            return false;
        }
    },

    deleteQuiz: async(quizId: string) => {
        try {
            const existsQuiz = await Quiz.findByIdAndDelete(quizId);
            if(!existsQuiz) return false;

            return existsQuiz;
        } catch (error) {
            console.log("Error at delete quiz: ",error);
            return false;
        }
    },

    deleteQuestion: async (questionId: string) => {
        try {
            const updatedQuiz = await Quiz.findOneAndUpdate(
            { "question._id": questionId }, // tìm quiz chứa question
            { $pull: { question: { _id: questionId } } }, // xóa question đó khỏi mảng
            { new: true } // trả về document đã cập nhật
            ).lean();

            if (!updatedQuiz) return false;

            return updatedQuiz;
        } catch (error) {
            console.log("Error at delete question:", error);
            return false;
        }
    },

    getQuestionById: async(questionId: string) => {
        try {
            const existsQuestion = await Quiz.findOne(
                {"question._id":questionId},
                {"question.$":1,topic:1, createdAt: 1}
            ).lean();

             if (!existsQuestion || !existsQuestion.question?.length) return false;

            return {
                topic: existsQuestion.topic,
                question: existsQuestion.question[0],
            };
        } catch (error) {
            console.log("Error at get quiz by id: ",error);
            return false;
        }
    },

}