import asynchandler from 'express-async-handler'
import { postService } from '../services/post.service'
import { IPost } from '../models/post.model';
import { User } from '../models/user.model';
import { IPostConstants } from '../constants/post.constant';
import { get } from 'mongoose';
import { commentService } from '../services/comment.service';
import { HttpStatus } from '../constants/http.constant';

export const postController = {
    createPost: asynchandler(async (req, res) => {
        const userId = req.params.id;
        if (!userId) {
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("User ID is required to create a post");
        }

        const existingUserId = await User.findById(userId);
        if (!existingUserId) {
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("User not found!");
        }

        const postData:IPost = req.body;
        postData.userId = userId;
        if(!postData.title || !postData.category || !postData.content){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Invalid post data: userId, title, category and content are required");
        }

        const result = await postService.createPost(postData);

        if (!result) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR);
            throw new Error("Create post failed due to internal error");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "New post created successfully",
            data: result,
        });
    }),

    getPostsByUserId: asynchandler(async (req, res) => {
        const userId = req.params.id;
        const posts = await postService.getPostsByUserId(userId);
        if (!posts) {
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("No posts found for the given user ID");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            data: posts,
        });
    }),

    getPostById: asynchandler(async (req, res) => {
        const postId = req.params.postId;
        if(!postId){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Post ID is required");
        }
        const post = await postService.getPostById(postId);
        if (!post) {
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("Post not found");
        }
        const comments = await commentService.getCommentsByPostId(postId);
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Post details retrieved successfully",
            data: {
                post,
                comments: comments || [],
            },
        });
    }),

    updatePost: asynchandler(async (req, res) => {
        const postId = req.params.postId;
        const updateData: Partial<IPostConstants> = req.body;
        const updatedPost = await postService.updatePost(postId, updateData);
        if (!updatedPost) {
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("Post not found or update failed");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Post updated successfully",
            data: updatedPost,
        });
    }),

    deletePost: asynchandler(async (req, res) => {
        const postId = req.params.postId;
        const isDeleted = await postService.deletePost(postId);
        if (!isDeleted) {
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("Post not found or delete failed");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            message: "Post deleted successfully",
        });
    }),

    getAllPosts: asynchandler(async (req, res) => {
        const posts = await postService.getAllPosts();
        if (!posts) {
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("No posts found");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            total: posts.length,
            data: posts,
        });
    }),

    getPostsByCategory: asynchandler(async (req, res) => {
        const category = req.query.category;
        if(!category){
            res.status(HttpStatus.BAD_REQUEST);
            throw new Error("Category query parameter is required");
        }
        const posts = await postService.getPostByCategory(category as string);
        if (!posts) {
            res.status(HttpStatus.NOT_FOUND);
            throw new Error("No posts found for the given category");
        }
        res.status(HttpStatus.OK).json({
            status: "Success",
            total: posts.length,
            data: posts,
        });
    }),
}