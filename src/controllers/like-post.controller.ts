import { Request, Response } from "express";
import { likeService } from "../services/like-post.service"; 
import { HttpStatus } from "../constants/http.constant";
import asynchandler from 'express-async-handler'
import { userService } from "../services/user.service";
import { postService } from "../services/post.service";
import { get } from "mongoose";

export const likePostController = {
  toggleLike: asynchandler(async (req: Request, res: Response) => {
    const userId = req.body.userId as string;
    const postId = req.body.postId as string;
    if (!userId || !postId) {
      res.status(HttpStatus.BAD_REQUEST);
      throw new Error("User ID and Post ID are required to toggle like");
    }
    const existsUser = await userService.getUserbyid(userId);
    if(!existsUser){
      res.status(HttpStatus.NOT_FOUND);
      throw new Error("User not found");
    }
    const existsPost = await postService.getPostById(postId);
    if(!existsPost){
      res.status(HttpStatus.NOT_FOUND);
      throw new Error("Post not found");
    }
    const result = await likeService.toggleLike(userId, postId);
    res.status(HttpStatus.OK).json({
        status: "Success",
        message: result === "Liked" ? "Post liked successfully" : "Post unliked successfully",
        statusliked: result,
    });
  }),

  checkUserLiked: asynchandler(async(req: Request, res: Response) => {
    const userId = req.query.userId as string;
    const postId = req.query.postId as string;
    if (!userId || !postId) {
      res.status(HttpStatus.BAD_REQUEST);
      throw new Error("User ID and Post ID are required to check like status");
    }
    const liked = await likeService.checkUserLiked(userId, postId);
    res.status(HttpStatus.OK).json({
        status: "Success",
        message: liked ? "User has liked the post" : "User has not liked the post",
        liked: liked,
    });
  }),

  getLikesByPostId: asynchandler(async(req: Request, res: Response) => {
    const postId = req.params.postId as string;
    if (!postId) {
      res.status(HttpStatus.BAD_REQUEST);
      throw new Error("Post ID is required to get likes");
    }
    const likes = await likeService.getLikesByPostId(postId);
    if (!likes) {
      res.status(HttpStatus.NOT_FOUND);
      throw new Error("No likes found for this post");
    }
    const countLike = await likeService.countLikesByPost(postId);
    res.status(HttpStatus.OK).json({
        status: "Success",
        countLike: countLike,
        data: { likes },
    });
  }),

  countLikesByPost: asynchandler(async(req: Request, res: Response) => {
    const postId = req.params.postId as string;
    if (!postId) {
      res.status(HttpStatus.BAD_REQUEST);
      throw new Error("Post ID is required to count likes");
    }
    const count = await likeService.countLikesByPost(postId);
    res.status(HttpStatus.OK).json({
        status: "Success",
        data: { count },
    });
  }),

  getAllLikes: asynchandler(async(req: Request, res: Response) => {
    const likes = await likeService.getAllLikes();
    res.status(HttpStatus.OK).json({
        status: "Success",
        data: { likes },
    });
  }),

  getLikesByUserId: asynchandler(async(req: Request, res: Response) => {
    const userId = req.params.userId as string;
    if (!userId) {
      res.status(HttpStatus.BAD_REQUEST);
      throw new Error("User ID is required to get likes");
    }
    const likes = await likeService.getLikesByUserId(userId);
    if (!likes) {
      res.status(HttpStatus.NOT_FOUND);
      throw new Error("No likes found for this user");
    }
    res.status(HttpStatus.OK).json({
        status: "Success",
        data: { likes },
    });
  }),
};