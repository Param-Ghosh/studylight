import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

// 🟢 Add Comment Mutation
export const addComment = mutation({
  args: {
    content: v.string(),
    postId: v.id("posts"),
  },

  handler: async (ctx, args) => {
    // Get current authenticated user
    const currentUser = await getAuthenticatedUser(ctx);

    // Check if post exists
    const post = await ctx.db.get(args.postId);
    if (!post) throw new ConvexError("Post not found");

    // Insert comment
    const commentId = await ctx.db.insert("comments", {
      userId: currentUser._id,
      postId: args.postId,
      content: args.content,
    });

    // Increment post's comment count (safe check)
    await ctx.db.patch(args.postId, {
      comments: (post.comments ?? 0) + 1,
    });

    // Create a notification if commenter isn't post owner
    if (post.userId !== currentUser._id) {
      await ctx.db.insert("notifications", {
        receiverId: post.userId,
        senderId: currentUser._id,
        type: "comment",
        postId: args.postId,
        commentId,
      });
    }

    return commentId;
  },
});

// 🟢 Get Comments Query (Safe version)
export const GetComments = query({
  args: { postId: v.id("posts") },

  handler: async (ctx, args) => {
    // Fetch comments for post
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_Post", (q) => q.eq("postId", args.postId))
      .order("desc") // optional: newest first
      .collect();

    // Attach user info safely
    const commentsWithInfo = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);

        // If user not found, return placeholder info
        if (!user) {
          console.warn(`⚠️ Missing user for comment ${comment._id}`);
          return {
            ...comment,
            user: {
              fullname: "Deleted User",
              image: "https://via.placeholder.com/150?text=Deleted+User",
            },
          };
        }

        // Normal case — user found
        return {
          ...comment,
          user: {
            fullname: user.fullname,
            image: user.image,
          },
        };
      })
    );

    return commentsWithInfo;
  },
});
