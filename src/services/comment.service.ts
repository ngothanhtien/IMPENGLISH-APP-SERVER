import { ICommentConstant } from '../constants/comment.constant';
import { Comment } from '../models/comment.model';

export const commentService = {
    addComment: async (userId: string,commentData: ICommentConstant) => {
        try {
            const newComment = new Comment(commentData);
            newComment.userId = userId;
            const savedComment = await newComment.save();
            return savedComment;
        } catch (error) {
            console.error("Error adding comment:", error);
            return null;
        }
    },

    getCommentsByPostId: async(postId: string) => {
        try {
            const comments = await Comment.find({ postId });
            return comments;
        } catch (error) {
            console.error("Error fetching comments by postId:", error);
            return null;
        }
    },

    deleteComment: async(commentId: string) => {
        try {
            await Comment.findByIdAndDelete(commentId);
            return true;
        } catch (error) {
            console.error("Error deleting comment:", error);
            return false;
        }
    },

    addLikeToComment: async(commentId: string) => {
        try {
            const comment = await Comment.findById(commentId);
            if (!comment) {
                return null;
            }
            comment.countLike = (comment.countLike || 0) + 1;
            const updatedComment = await comment.save();
            return updatedComment;
        } catch (error) {
            console.error("Error adding like to comment:", error);
            return null;
        }
    },

    updateComment: async (commentId: string, updateData: Partial<ICommentConstant>) => {
        try {
            const updatedComment = await Comment.findByIdAndUpdate(
                commentId,
                { $set: updateData },
                { new: true }
            );
            return updatedComment;
        } catch (error) {
            console.error("Error updating comment:", error);
            return null;
        }
    },
}