import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createProfile = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if profile already exists
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) throw new Error("Profile already exists");

    // Create new profile (inactive by default)
    return await ctx.db.insert("profiles", {
      userId,
      name: args.name,
      role: "intern",
      isActive: false,
    });
  },
});

export const getProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const approveUser = mutation({
  args: {
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!adminProfile || adminProfile.role !== "staff") {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.profileId, { isActive: true });
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile || profile.role !== "staff") return null;

    return await ctx.db.query("profiles").collect();
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const patchData: Record<string, any> = {};
    if (args.name) patchData.name = args.name;

    if (Object.keys(patchData).length > 0) {
      await ctx.db.patch(profile._id, patchData);
    }
  },
});

export const toggleUserStatus = mutation({
  args: {
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!adminProfile || adminProfile.role !== "staff") {
      throw new Error("Not authorized");
    }

    const targetProfile = await ctx.db.get(args.profileId);
    if (!targetProfile) throw new Error("Profile not found");

    await ctx.db.patch(args.profileId, { isActive: !targetProfile.isActive });
  },
});

export const promoteToStaff = mutation({
  args: {
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const adminProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!adminProfile || adminProfile.role !== "staff") {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.profileId, { role: "staff" });
  },
});
