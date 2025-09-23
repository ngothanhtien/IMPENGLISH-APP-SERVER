import mongoose,{ Document,model,Schema } from "mongoose";

export interface IFlashCard extends Document{
    userId?: string;
    vocabularyId?: string;
    nextReview?: Date;
    reviewCount?: number;
    easeFactor?: number;
}
const flashCardSchema  = new Schema<IFlashCard>({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vocabularyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vocabulary',
        required: true
    },
    nextReview:{
        type: Date,
        required: true
    },
    reviewCount:{
        type: Number
    },
    easeFactor:{
        type: Number
    }
},{
    timestamps: true
});
export const flashCard = model<IFlashCard>("FlashCard",flashCardSchema);