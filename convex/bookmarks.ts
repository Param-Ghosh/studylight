import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";


export const toggleBookmark = mutation({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const currentUserId = await getAuthenticatedUser(ctx); 

        const existing = await ctx.db
            .query("bookmarks")
            .withIndex("by_User_and_Post", (q) =>
                q.eq("userId", currentUserId._id).eq("postId", args.postId)
            )
            .first();
        if (existing) {
            await ctx.db.delete(existing._id);
            return false; // Bookmark removed
        } else {
            await ctx.db.insert("bookmarks", {
                userId: currentUserId._id,
                postId: args.postId
            });
            return true; // Bookmark added
        }    
    },
});

export const getBookmarkedPosts = query({
    handler: async (ctx) => {
        const currentUser = await getAuthenticatedUser(ctx);

        //get all bookmarks for the current user
        const bookmarks = await ctx.db
            .query("bookmarks")
            .withIndex("by_User", (q) => q.eq("userId", currentUser._id))
            .order("desc")
            .collect();

        const bookmarksWithInfo = await Promise.all(
            bookmarks.map(async (bookmark) => {
                const post = await ctx.db.get(bookmark.postId);
                return { bookmark, post };
            })
        );

        return bookmarksWithInfo;
    },
});