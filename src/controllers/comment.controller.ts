import { ICommentConstant } from "../constants/comment.constant";
import { HttpStatus } from "../constants/http.constant";
import { commentService } from "../services/comment.service";
import asynchandler from 'express-async-handler'
export const commentController = {
    addComment: asynchandler(async (req, res) => {
        const userId = req.params.id;
        if (!userId) {
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("User ID is required to add a comment");
        }
        const commentData: ICommentConstant = req.body;
        if (!commentData.postId || !commentData.content) {
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Invalid comment data: postId, userId and content are required");
        }
        const result = await commentService.addComment(userId,commentData);
        if (!result) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error("Add comment failed due to internal error");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "New comment added successfully",
            data: result,
        });
    }),

    getCommentsByPostId: asynchandler(async (req, res) => {
        const postId = req.params.postId;
        const comments = await commentService.getCommentsByPostId(postId);
        if (!comments) {
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("No comments found for the given post ID");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            data: comments,
        });
    }),

    deleteComment: asynchandler(async (req, res) => {
        const commentId = req.params.commentId;
        const isDeleted = await commentService.deleteComment(commentId);
        if (!isDeleted) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error("Delete comment failed due to internal error");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Comment deleted successfully",
        });
    }),

    addLikeToComment: asynchandler(async (req, res) => {
        const commentId = req.params.commentId;
        const updatedComment = await commentService.addLikeToComment(commentId);
        if (!updatedComment) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error("Add like to comment failed due to internal error");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Like added to comment successfully",
            data: updatedComment,
        });
    }),

    updateComment: asynchandler(async (req, res) => {
        const commentId = req.params.commentId;
        const updateData: Partial<ICommentConstant> = req.body;
        const updatedComment = await commentService.updateComment(commentId, updateData);
        if (!updatedComment) {
            res.status(500);
            throw new Error("Update comment failed due to internal error");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Comment updated successfully",
            data: updatedComment,
        });
    }),
}