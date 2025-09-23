import { Document,model,Schema } from "mongoose";

const quizSchema = new Schema<IQuizz>({
    topic:{
        type: String,
        required: [true,"Please enter your topic"]
    },
    question:[
        {
            questionText:{
                type: String
            },
            options: {
                type: [String]
            },
            correctAnswer:{
                type: String
            }
        }
    ]
},{
    timestamps: true
})
export const quizz = model<IQuizz>("Quizz",quizSchema);

export interface IQuizz extends Document {
    topic?: string;
    question?: [
        questionText?: string,
        options?: [string],
        correctAnswer?: string
    ]
}