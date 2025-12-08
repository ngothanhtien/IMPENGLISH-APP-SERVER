import mongoose,{ Document,model,Schema } from "mongoose";

export interface IQuizzResult extends Document{
    userId?: string,
    level?: "Easy" | "Medium" | "Hard",
    category?: string,
    totalQuestions?: number,
    correctAnswers?: number,
    incorrectAnswers?: number,
    questions?: Array<{
        questionId: string,
        questionText: string,
        selectedAnswer: string,
        correctAnswer: string,
        isCorrect: boolean
    }>,
    statusFinish?: boolean,
    completeAt?: Date
}
const quizResulSchema = new Schema<IQuizzResult>({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    level:{
        type: String,
        required:true
    },
    category:{
        type: String,
        required:true
    },
    totalQuestions:{
        type: Number,
        required:true
    },
    correctAnswers:{
        type: Number,
        required:true
    },
    incorrectAnswers:{
        type: Number,
        required:true
    },
    questions:[
        {
            questionId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
            questionText: { type: String, required: true },
            selectedAnswer: { type: String, required: true },
            correctAnswer: { type: String, required: true },
            isCorrect: { type: Boolean, required: true },
        }
    ],
    statusFinish:{
        type: Boolean,
        default: false
    },
    completeAt:{
        type: Date,
        default: Date.now()
    }
},{
    timestamps: true
})
export const QuizzResult = model<IQuizzResult>('QuizzResult',quizResulSchema);