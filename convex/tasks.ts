// convex/tasks.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all tasks for a user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get task by ID
export const getById = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
  },
});

// Create a new task
export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("done")
    ),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a task
export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("todo"),
        v.literal("in-progress"),
        v.literal("done")
      )
    ),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { taskId, ...updates } = args;
    return await ctx.db.patch(taskId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a task
export const remove = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.taskId);
    return { success: true };
  },
});