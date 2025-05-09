import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("intern"), v.literal("staff")),
    name: v.string(),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_active", ["isActive"]),

  workSessions: defineTable({
    userId: v.id("users"),
    checkIn: v.number(),
    checkOut: v.optional(v.number()),
    duration: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_time", ["userId", "checkIn"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
