import mongoose,{ Document,model,Schema } from "mongoose";

export interface IQuizzResult extends Document{
    userId?: string,
    quizzId?:string,
    score?: number,
    completeAt?: Date
}
const quizResulSchema = new Schema<IQuizzResult>({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizzId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quizz',
        required:true
    },
    score:{
        type: Number,
    },
    completeAt:{
        type: Date
    }
},{
    timestamps: true
})
export const quizzRS = model<IQuizzResult>('QuizzResult',quizResulSchema);