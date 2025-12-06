// convex/users.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getByName = query({
  args: { 
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    // Query all users and filter by firstName and lastName
    // Note: This is not indexed, so for better performance, consider adding a composite index
    const allUsers = await ctx.db.query("users").collect();
    return allUsers.find(
      (user) =>
        user.firstName === args.firstName && user.lastName === args.lastName
    ) || null;
  },
});

export const createOrUpdate = mutation({
  args: {
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return await ctx.db.patch(existingUser._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        imageUrl: args.imageUrl,
      });
    }

    return await ctx.db.insert("users", {
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      imageUrl: args.imageUrl,
    });
  },
});

export const updateProfileImage = mutation({
  args: {
    userId: v.id("users"),
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, {
      imageStorageId: args.imageStorageId,
    });
  },
});