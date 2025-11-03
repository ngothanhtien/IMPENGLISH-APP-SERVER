import { Document,model,Schema } from "mongoose";

export interface IQuestion {
    questionText: string;
    options: string[];
    correctAnswer: string;
    level?: "Easy" | "Medium" | "Hard";
}

export interface IQuiz extends Document {
    topic: string;
    question: IQuestion[];
}

const quizSchema = new Schema<IQuiz>({
    topic:{
        type: String,
        required: [true,"Please enter your topic"],
        enum: ['Technology','Business','Education','Sports','Entertainment','Science','History','Conversation']
    },
    question:[
        {
            questionText:{ type: String, required: [true,"Please enter your topic"]},
            options: { type: [String], required: true},
            correctAnswer: {type: String, required: true},
            level: {
                type: String,
                enum: ["Easy", "Medium", "Hard"],
                default: "Easy",
            },
        }
    ]
},{
    timestamps: true
})

export const Quiz = model<IQuiz>("Quiz",quizSchema);