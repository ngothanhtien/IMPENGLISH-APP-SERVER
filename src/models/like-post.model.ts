import mongoose, { Document, Schema, model } from "mongoose";

export interface ILike extends Document {
  userId?: string;
  postId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true }
);

// Một user chỉ được like 1 lần / post
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const Like = model<ILike>("Like", LikeSchema);
