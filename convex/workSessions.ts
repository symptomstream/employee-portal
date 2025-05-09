import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const checkIn = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("Profile not found");
    if (!profile.isActive) throw new Error("Account not active");

    // Check if there's already an active session
    const activeSession = await ctx.db
      .query("workSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("checkOut"), undefined))
      .unique();
    if (activeSession) throw new Error("Already checked in");

    return await ctx.db.insert("workSessions", {
      userId,
      checkIn: Date.now(),
    });
  },
});

export const checkOut = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const activeSession = await ctx.db
      .query("workSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("checkOut"), undefined))
      .unique();
    if (!activeSession) throw new Error("No active session");

    const checkOut = Date.now();
    const duration = checkOut - activeSession.checkIn;
    return await ctx.db.patch(activeSession._id, { checkOut, duration });
  },
});

export const getCurrentSession = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("workSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("checkOut"), undefined))
      .unique();
  },
});

export const getWorkSessions = query({
  args: {
    userId: v.id("users"),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .unique();
    if (!profile) return null;

    // Only allow staff to view other users' sessions
    if (profile.role !== "staff" && currentUserId !== args.userId) return null;

    let query = ctx.db
      .query("workSessions")
      .withIndex("by_user_and_time", (q) => q.eq("userId", args.userId));

    if (args.startTime) {
      query = query.filter((q) => q.gte(q.field("checkIn"), args.startTime!));
    }
    if (args.endTime) {
      query = query.filter((q) => q.lte(q.field("checkIn"), args.endTime!));
    }

    return await query.collect();
  },
});
