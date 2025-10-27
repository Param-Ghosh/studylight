import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        username: v.string(),
        fullname: v.string(), // ⚡ match with your mutation
        email: v.string(),
        bio: v.optional(v.string()),
        image: v.string(),
        followers: v.number(),
        following: v.number(),
        posts: v.number(),
        clerkId: v.string(),
    }).index("by_Clerk_Id", ["clerkId"]),

    posts: defineTable({
        userId: v.id("users"),
        imageUrl: v.string(),
        storageId: v.id("_storage"), // ⚡ lowercase S for convention
        caption: v.optional(v.string()),
        likes: v.number(),
        comments: v.number(),
    }).index("by_User", ["userId"]),

    likes: defineTable({
        userId: v.id("users"),
        postId: v.id("posts"),
    })
    .index("by_Post", ["postId"])
    .index("by_User_and_post", ["userId", "postId"]),

    comments: defineTable({ // ⚡ lowercase table name for convention
        userId: v.id("users"),
        postId: v.id("posts"),
        content: v.string(),
    }).index("by_Post", ["postId"]),

    follows: defineTable({
        followerId: v.id("users"),
        followingId: v.id("users"),
    })
    .index("by_Follower", ["followerId"])
    .index("by_Following", ["followingId"])
    .index("by_both", ["followerId", "followingId"]),

    notifications: defineTable({
        receiverId: v.id("users"), // ⚡ fixed typo
        senderId: v.id("users"),
        type: v.union(v.literal("like"), v.literal("comment"), v.literal("follow")),
        postId: v.optional(v.id("posts")),
        commentId: v.optional(v.id("comments")),
    }).index("by_Receiver", ["receiverId"])
      .index("by_post", ["postId"]),

    bookmarks: defineTable({
        userId: v.id("users"),
        postId: v.id("posts"),
    })
    .index("by_User", ["userId"])
    .index("by_Post", ["postId"])
    .index("by_User_and_Post", ["userId", "postId"]),
});
