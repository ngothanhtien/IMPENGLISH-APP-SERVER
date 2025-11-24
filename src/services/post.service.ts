import { get } from "mongoose";
import { IPost,Post } from "../models/post.model";
import { IPostConstants } from "../constants/post.constant";


export const postService = {
    createPost: async (postData: IPost): Promise<IPost | null> => {
        try {
            const newPost = new Post(postData);
            const savedPost = await newPost.save();
            return savedPost;
        } catch (error) {
            console.error("Error creating post:", error);
            return null;
        } 
    },

    getPostsByUserId: async (userId: string): Promise<IPost[] | null> => {
        try {
            const posts = await Post.find({ userId });
            return posts;
        } catch (error) {
            console.error("Error fetching posts by userId:", error);
            return null;
        }
    },

    getPostById: async (postId: string): Promise<IPost | null> => {
        try {
            const post = await Post.findById(postId).populate("userId", "fullName streakDay level");
            return post;
        }
        catch (error) {
            console.error("Error fetching post by id:", error);
            return null;
        }
    },

    updatePost: async (postId: string, updateData: Partial<IPostConstants>): Promise<IPost | null> => {
        try {
            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $set: updateData},
                { new: true }
            );
            return updatedPost;
        } catch (error) {
            console.error("Error updating post:", error);
            return null;
        }
    },

    deletePost: async (postId: string): Promise<boolean> => {
        try {
            await Post.findByIdAndDelete(postId);
            return true;
        } catch (error) {
            console.error("Error deleting post:", error);
            return false;
        }
    },

    getAllPosts: async (): Promise<IPost[] | null> => {
        try {
            const posts = await Post.find().populate("userId", "fullName streakDay level");
            return posts;
        } catch (error) {
            console.error("Error fetching all posts:", error);
            return null;
        }
    },

    getPostByCategory: async (category: string): Promise<IPost[] | null> => {
        try {
            const posts = await Post.find({ category });
            return posts;
        } catch (error) {
            console.error("Error fetching posts by category:", error);
            return null;
        }
    },

    likePost: async (postId: string): Promise<IPost | null> => {
        try {
            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $inc: { likes: 1 } },
                { new: true }
            );
            return updatedPost;
        } catch (error) {
            console.error("Error liking post:", error);
            return null;
        }
    },
};