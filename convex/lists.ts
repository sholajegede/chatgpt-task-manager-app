// convex/lists.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTasksByStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      todo: tasks.filter((task) => task.status === "todo"),
      inProgress: tasks.filter((task) => task.status === "in-progress"),
      done: tasks.filter((task) => task.status === "done"),
    };
  },
});

export const getTasksDueToday = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("dueDate"), today.getTime()),
          q.lt(q.field("dueDate"), tomorrow.getTime())
        )
      )
      .collect();
  },
});