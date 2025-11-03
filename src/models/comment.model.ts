import mongoose, { Document, model, Schema } from "mongoose";

export interface IComment extends Document {
  postId?: string;
  userId?: string;
  countLike?: number;
  content?: string;
}

const commentSchema = new Schema<IComment>({
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    countLike:{
        type: Number,
        default: 0
    },
    content:{
        type: String,
        required: true
    }
},{
    timestamps: true
});

export const Comment = model<IComment>('Comment', commentSchema);
