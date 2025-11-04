import mongoose, { Document, model, Schema } from "mongoose";

export interface IPost extends Document {
  userId?: string;
  title?: string;
  category?: string;
  content?: string;
  tags?: string[];
  countLike?: number;
}

const PostSchema = new Schema<IPost> ({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    tags:{
        type: [String],
        default: []
    },
    countLike:{
        type: Number,
        default: 0
    }
},{
    timestamps: true
})
export const Post = model<IPost>('Post', PostSchema);