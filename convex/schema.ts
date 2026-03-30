import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const deprecatedRitualStatus = v.union(v.literal("ACTIVE"), v.literal("ARCHIVED"));

const ritualMemberRole = v.union(
  v.literal("OWNER"),
  v.literal("ADMIN"),
  v.literal("MEMBER"),
);

const taskStatus = v.union(
  v.literal("OPEN"),
  v.literal("DONE"),
  v.literal("CANCELLED"),
);

const votingSessionStatus = v.union(
  v.literal("PENDING"),
  v.literal("REVEALED"),
  v.literal("DONE"),
  v.literal("CANCELLED"),
);

const deckType = v.union(
  v.literal("Fibonacci"),
  v.literal("T-Shirt"),
  v.literal("Linear"),
);

export default defineSchema({
  rituals: defineTable({
    title: v.string(),
    deckType,
    createdBy: v.string(),
    // Deprecated compatibility field for existing documents.
    status: v.optional(deprecatedRitualStatus),
    createdAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"]),

  ritualMembers: defineTable({
    ritualId: v.id("rituals"),
    userId: v.string(),
    // Optional for backward compatibility with existing members.
    name: v.optional(v.string()),
    role: ritualMemberRole,
    canVote: v.boolean(),
    isOnline: v.boolean(),
    joinedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_ritualId", ["ritualId"])
    .index("by_userId", ["userId"])
    .index("by_ritualId_and_userId", ["ritualId", "userId"])
    .index("by_ritualId_and_canVote", ["ritualId", "canVote"]),

  tasks: defineTable({
    ritualId: v.id("rituals"),
    title: v.string(),
    description: v.optional(v.string()),
    externalRef: v.optional(v.string()),
    clickUpId: v.optional(v.string()),
    status: taskStatus,
    createdAt: v.number(),
  })
    .index("by_ritualId", ["ritualId"])
    .index("by_ritualId_and_status", ["ritualId", "status"]),

  votingSessions: defineTable({
    ritualId: v.id("rituals"),
    taskId: v.id("tasks"),
    createdBy: v.string(),
    status: votingSessionStatus,
    autoRevealWhenAllVoted: v.boolean(),
    finalScore: v.optional(v.string()),
    startedAt: v.number(),
    revealedAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
  })
    .index("by_ritualId", ["ritualId"])
    .index("by_taskId", ["taskId"])
    .index("by_ritualId_and_status", ["ritualId", "status"])
    .index("by_ritualId_and_startedAt", ["ritualId", "startedAt"]),

  votes: defineTable({
    sessionId: v.id("votingSessions"),
    userId: v.string(),
    score: v.union(v.string(), v.null()),
    hasVoted: v.boolean(),
    voteStatus: v.union(
      v.literal("PRONTO"),
      v.literal("PENSANDO"),
      v.literal("VOTADO"),
    ),
    votedAt: v.optional(v.number()),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_sessionId_and_userId", ["sessionId", "userId"])
    .index("by_sessionId_and_hasVoted", ["sessionId", "hasVoted"])
    .index("by_userId_and_sessionId", ["userId", "sessionId"]),
});
