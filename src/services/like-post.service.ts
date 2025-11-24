import { Like, ILike } from "../models/like-post.model";
import { Post } from "../models/post.model";

export const likeService = {
  toggleLike: async (userId: string, postId: string): Promise<string> => {
    try {
      const existingLike = await Like.findOne({ userId, postId });

      if (existingLike) {
        // Nếu đã like - unlike
        await Like.deleteOne({ userId, postId });
        await Post.findByIdAndUpdate(postId, { $inc: { countLike: -1 } });
        return "Unliked";
      } else {
        // Nếu chưa like - thêm like
        await Like.create({ userId, postId });
        await Post.findByIdAndUpdate(postId, { $inc: { countLike: 1 } });
        return "Liked";
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      throw new Error("Failed to toggle like");
    }
  },

  checkUserLiked: async (userId: string, postId: string): Promise<boolean> => {
    try {
      const liked = await Like.exists({ userId, postId });
      return !!liked;
    } catch (error) {
      console.error("Error checking user like:", error);
      return false;
    }
  },

  getLikesByPostId: async (postId: string): Promise<ILike[]> => {
    try {
      const likes = await Like.find({ postId }).populate("userId", "name email");
      return likes;
    } catch (error) {
      console.error("Error getting likes by postId:", error);
      throw new Error("Failed to get likes");
    }
  },

  countLikesByPost: async (postId: string): Promise<number> => {
    try {
      const count = await Like.countDocuments({ postId });
      return count;
    } catch (error) {
      console.error("Error counting likes:", error);
      return 0;
    }
  },

  getLikesByUserId: async (userId: string): Promise<ILike[]> => {
    try {
      const likes = await Like.find({ userId }).populate("postId", "title content");
      return likes;
    } catch (error) {
      console.error("Error getting likes by userId:", error);
      throw new Error("Failed to get likes");
    }
  },

  getAllLikes: async (): Promise<ILike[]> => {
    try {
      const likes = await Like.find().populate("userId", "name email").populate("postId", "title content");
      return likes;
    } catch (error) {
      console.error("Error getting all likes:", error);
      throw new Error("Failed to get likes");
    }
  },
};
