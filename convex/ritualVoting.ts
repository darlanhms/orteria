import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  action,
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

type VotingSessionStatus = Doc<"votingSessions">["status"];

const ritualDeckTypeValidator = v.union(
  v.literal("Fibonacci"),
  v.literal("T-Shirt"),
  v.literal("Linear"),
);

const deckScores: Record<Doc<"rituals">["deckType"], ReadonlySet<string>> = {
  Fibonacci: new Set(["0", "1", "2", "3", "5", "8", "13"]),
  "T-Shirt": new Set(["RN", "PP", "P", "M", "G", "GG", "XGG"]),
  Linear: new Set(["1", "2", "3", "4", "5", "6", "7"]),
};

const deckOptions = {
  Fibonacci: [
    { id: "0", label: "0", sizingLabel: "NULO" },
    { id: "1", label: "1", sizingLabel: "MUITO PEQUENO" },
    { id: "2", label: "2", sizingLabel: "PEQUENO" },
    { id: "3", label: "3", sizingLabel: "MÉDIO-PEQUENO" },
    { id: "5", label: "5", sizingLabel: "MÉDIO" },
    { id: "8", label: "8", sizingLabel: "GRANDE" },
    { id: "13", label: "13", sizingLabel: "MUITO GRANDE" },
  ],
  "T-Shirt": [
    { id: "RN", label: "RN", sizingLabel: "ATE 1 HORA", clickUpOptionValue: "c8a84df7-0957-476d-9ddf-afadfa3aad88" },
    { id: "PP", label: "PP", sizingLabel: "1 A 4 HORAS", clickUpOptionValue: "77ed47da-ddb9-4d60-a13e-0884f7e6ed36" },
    { id: "P", label: "P", sizingLabel: "4 A 8 HORAS", clickUpOptionValue: "c97dcbcf-4831-4a3d-8a32-d82d6bae7d11" },
    { id: "M", label: "M", sizingLabel: "8 A 16 HORAS", clickUpOptionValue: "003ab98d-124b-4137-92b7-dd5652732e74" },
    { id: "G", label: "G", sizingLabel: "16 A 24 HORAS", clickUpOptionValue: "ac6dffd3-dc67-4146-89ed-0dfed8d534d7" },
    { id: "GG", label: "GG", sizingLabel: "24 A 40 HORAS", clickUpOptionValue: "61c44ebf-6e61-4a80-b590-b1563ee901a3" },
    { id: "XGG", label: "XGG", sizingLabel: "MAIS QUE 40 HORAS", clickUpOptionValue: "a5239881-574a-464d-8d84-d0dd6ccb37d4" },
  ],
  Linear: [
    { id: "1", label: "1", sizingLabel: "MUITO PEQUENO" },
    { id: "2", label: "2", sizingLabel: "PEQUENO" },
    { id: "3", label: "3", sizingLabel: "MÉDIO-PEQUENO" },
    { id: "4", label: "4", sizingLabel: "MÉDIO" },
    { id: "5", label: "5", sizingLabel: "MÉDIO-GRANDE" },
    { id: "6", label: "6", sizingLabel: "GRANDE" },
    { id: "7", label: "7", sizingLabel: "MUITO GRANDE" },
  ],
} as const;

function resolveClickUpScoreValue(
  deckType: Doc<"rituals">["deckType"],
  score: string,
): string {
  const option = deckOptions[deckType].find((deckOption) => deckOption.id === score);
  if (!option) {
    return score;
  }
  if ("clickUpOptionValue" in option && option.clickUpOptionValue) {
    return option.clickUpOptionValue;
  }
  return score;
}

async function requireAuthenticatedUser(ctx: MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.tokenIdentifier;
}

async function requireAuthenticatedUserQuery(ctx: QueryCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.tokenIdentifier;
}

async function getRitualMember(
  ctx: MutationCtx,
  ritualId: Id<"rituals">,
  userId: string,
): Promise<Doc<"ritualMembers">> {
  const member = await ctx.db
    .query("ritualMembers")
    .withIndex("by_ritualId_and_userId", (q) =>
      q.eq("ritualId", ritualId).eq("userId", userId),
    )
    .unique();

  if (!member) {
    throw new Error("Unauthorized");
  }

  return member;
}

function requireRitualAdmin(member: Doc<"ritualMembers">): void {
  if (member.role !== "OWNER" && member.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
}

function requireValidScore(
  deckType: Doc<"rituals">["deckType"],
  score: string,
): void {
  const allowedScores = deckScores[deckType];
  if (!allowedScores.has(score)) {
    throw new Error("Invalid score for ritual deck");
  }
}

async function getSessionOrThrow(
  ctx: MutationCtx,
  sessionId: Id<"votingSessions">,
): Promise<Doc<"votingSessions">> {
  const session = await ctx.db.get(sessionId);
  if (!session) {
    throw new Error("Voting session not found");
  }
  return session;
}

function requireOpenStatus(status: VotingSessionStatus): void {
  if (status !== "PENDING") {
    throw new Error("Voting session is not pending");
  }
}

async function countVotersInRitual(
  ctx: MutationCtx,
  ritualId: Id<"rituals">,
): Promise<number> {
  let count = 0;
  const votersQuery = ctx.db
    .query("ritualMembers")
    .withIndex("by_ritualId_and_canVote", (q) =>
      q.eq("ritualId", ritualId).eq("canVote", true),
    );

  for await (const _member of votersQuery) {
    count += 1;
  }

  return count;
}

async function countSubmittedVotes(
  ctx: MutationCtx,
  session: Doc<"votingSessions">,
): Promise<number> {
  const eligibleVoterIds = new Set<string>();
  const votersQuery = ctx.db
    .query("ritualMembers")
    .withIndex("by_ritualId_and_canVote", (q) =>
      q.eq("ritualId", session.ritualId).eq("canVote", true),
    );
  for await (const voter of votersQuery) {
    eligibleVoterIds.add(voter.userId);
  }

  let count = 0;
  const votesQuery = ctx.db
    .query("votes")
    .withIndex("by_sessionId_and_hasVoted", (q) =>
      q.eq("sessionId", session._id).eq("hasVoted", true),
    );

  for await (const vote of votesQuery) {
    if (!eligibleVoterIds.has(vote.userId)) {
      continue;
    }
    count += 1;
  }

  return count;
}

async function assertAllVotesSubmitted(
  ctx: MutationCtx,
  session: Doc<"votingSessions">,
): Promise<void> {
  const voterCount = await countVotersInRitual(ctx, session.ritualId);
  const submittedVotes = await countSubmittedVotes(ctx, session);
  if (voterCount === 0 || submittedVotes < voterCount) {
    throw new Error("Cannot reveal votes before everyone votes");
  }
}

export const createVotingSession = mutation({
  args: {
    ritualId: v.id("rituals"),
    taskId: v.id("tasks"),
    autoRevealWhenAllVoted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const member = await getRitualMember(ctx, args.ritualId, userId);
    requireRitualAdmin(member);

    const task = await ctx.db.get(args.taskId);
    if (!task || task.ritualId !== args.ritualId) {
      throw new Error("Task not found in ritual");
    }

    const pendingSession = await ctx.db
      .query("votingSessions")
      .withIndex("by_ritualId_and_status", (q) =>
        q.eq("ritualId", args.ritualId).eq("status", "PENDING"),
      )
      .take(1);

    if (pendingSession.length > 0) {
      throw new Error("Ritual already has a pending voting session");
    }

    const now = Date.now();
    const sessionId = await ctx.db.insert("votingSessions", {
      ritualId: args.ritualId,
      taskId: args.taskId,
      createdBy: userId,
      status: "PENDING",
      autoRevealWhenAllVoted: args.autoRevealWhenAllVoted,
      startedAt: now,
    });

    return { sessionId };
  },
});

export const createVotingSessionFromTitle = mutation({
  args: {
    ritualId: v.id("rituals"),
    sessionName: v.string(),
    externalUrl: v.optional(v.string()),
    clickUpId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const member = await getRitualMember(ctx, args.ritualId, userId);
    requireRitualAdmin(member);

    const sessionName = args.sessionName.trim();
    if (sessionName.length === 0) {
      throw new Error("Session name is required");
    }
    const externalUrl = args.externalUrl?.trim() || undefined;
    if (externalUrl) {
      if (externalUrl.length > 2048) {
        throw new Error("External URL is too long");
      }
      try {
        const parsed = new URL(externalUrl);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          throw new Error("Invalid URL protocol");
        }
      } catch {
        throw new Error("External URL must be a valid http(s) URL");
      }
    }
    const clickUpId = args.clickUpId?.trim() || undefined;
    if (clickUpId && !/^[a-zA-Z0-9_-]+$/.test(clickUpId)) {
      throw new Error("Invalid ClickUp task id");
    }

    const pendingSession = await ctx.db
      .query("votingSessions")
      .withIndex("by_ritualId_and_status", (q) =>
        q.eq("ritualId", args.ritualId).eq("status", "PENDING"),
      )
      .take(1);

    const revealedSession = await ctx.db
      .query("votingSessions")
      .withIndex("by_ritualId_and_status", (q) =>
        q.eq("ritualId", args.ritualId).eq("status", "REVEALED"),
      )
      .take(1);

    if (pendingSession.length > 0 || revealedSession.length > 0) {
      throw new Error("There is already an unfinished voting session");
    }

    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      ritualId: args.ritualId,
      title: sessionName,
      externalRef: externalUrl,
      clickUpId,
      status: "OPEN",
      createdAt: now,
    });

    const sessionId = await ctx.db.insert("votingSessions", {
      ritualId: args.ritualId,
      taskId,
      createdBy: userId,
      status: "PENDING",
      autoRevealWhenAllVoted: false,
      startedAt: now,
    });

    return { sessionId, taskId };
  },
});

export const getSessionScreenData = query({
  args: {
    ritualId: v.id("rituals"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await requireAuthenticatedUserQuery(ctx);

    const ritual = await ctx.db.get(args.ritualId);
    if (!ritual) {
      return null;
    }

    const membership = await ctx.db
      .query("ritualMembers")
      .withIndex("by_ritualId_and_userId", (q) =>
        q.eq("ritualId", args.ritualId).eq("userId", currentUserId),
      )
      .unique();

    if (!membership) {
      throw new Error("Unauthorized");
    }

    const pendingSession = await ctx.db
      .query("votingSessions")
      .withIndex("by_ritualId_and_status", (q) =>
        q.eq("ritualId", args.ritualId).eq("status", "PENDING"),
      )
      .take(1);

    let currentVotingSession: Doc<"votingSessions"> | null = pendingSession[0] ?? null;
    if (!currentVotingSession) {
      const latestSessions = await ctx.db
        .query("votingSessions")
        .withIndex("by_ritualId_and_startedAt", (q) => q.eq("ritualId", args.ritualId))
        .order("desc")
        .take(10);
      currentVotingSession =
        latestSessions.find((session) => session.status === "REVEALED") ?? null;
    }
    const votesByUserId: Record<string, boolean> = {};
    const voteStatusByUserId: Record<string, "PRONTO" | "PENSANDO" | "VOTADO"> = {};
    const voteScoreByUserId: Record<string, string | null> = {};

    if (currentVotingSession) {
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", currentVotingSession._id))
        .collect();

      for (const vote of votes) {
        votesByUserId[vote.userId] = vote.hasVoted;
        voteStatusByUserId[vote.userId] = vote.voteStatus;
        voteScoreByUserId[vote.userId] = vote.score;
      }
    }

    const currentTask = currentVotingSession
      ? await ctx.db.get(currentVotingSession.taskId)
      : null;

    const ritualMembers = await ctx.db
      .query("ritualMembers")
      .withIndex("by_ritualId", (q) => q.eq("ritualId", args.ritualId))
      .collect();
    const memberCanVoteByMemberId: Record<string, boolean> = {};
    const memberCanVoteByUserId: Record<string, boolean> = {};
    for (const member of ritualMembers) {
      memberCanVoteByMemberId[member._id] = member.canVote;
      memberCanVoteByUserId[member.userId] = member.canVote;
    }

    const participants = ritualMembers.map((member) => {
      const hasVoted = votesByUserId[member.userId] ?? false;
      const isCurrentUser = member.userId === currentUserId;
      const status: "PRONTO" | "PENSANDO" | "VOTADO" = member.canVote
        ? currentVotingSession?.status === "PENDING"
          ? voteStatusByUserId[member.userId] ?? (hasVoted ? "VOTADO" : "PENSANDO")
          : "PRONTO"
        : "PRONTO";

      const displayName = member.name?.trim() || (isCurrentUser ? "Você" : `Membro ${member.userId.slice(0, 6)}`);

      return {
        id: member._id,
        name: displayName,
        isCurrentUser,
        role: member.role,
        canVote: member.canVote,
        status,
        voteScore: voteScoreByUserId[member.userId] ?? null,
      };
    });

    const shouldShowResults =
      currentVotingSession?.status === "REVEALED" || currentVotingSession?.status === "DONE";
    const voteOptionOrder = deckOptions[ritual.deckType].map((option) => option.id);
    const filteredScoreCounts: Record<string, number> = {};
    let filteredTotalScoredVotes = 0;
    for (const [userId, score] of Object.entries(voteScoreByUserId)) {
      if (!memberCanVoteByUserId[userId]) {
        continue;
      }
      if (!score || !votesByUserId[userId]) {
        continue;
      }
      filteredScoreCounts[score] = (filteredScoreCounts[score] ?? 0) + 1;
      filteredTotalScoredVotes += 1;
    }

    const orderedDistribution = voteOptionOrder
      .map((score) => ({ score, count: filteredScoreCounts[score] ?? 0 }))
      .filter((item) => item.count > 0);
    const maxVoteCount = orderedDistribution.reduce((max, item) => Math.max(max, item.count), 0);
    const topScores = orderedDistribution
      .filter((item) => item.count === maxVoteCount)
      .map((item) => item.score);
    const hasTie = topScores.length > 1;
    const winnerScore = !hasTie && topScores.length === 1 ? topScores[0] : null;
    const agreementPercent =
      filteredTotalScoredVotes > 0 && maxVoteCount > 0
        ? Math.round((maxVoteCount / filteredTotalScoredVotes) * 100)
        : 0;
    const weightedSum = orderedDistribution.reduce((acc, item) => {
      const scoreIndex = voteOptionOrder.indexOf(item.score);
      return acc + (scoreIndex + 1) * item.count;
    }, 0);
    const averageScoreIndex =
      filteredTotalScoredVotes > 0
        ? Number((weightedSum / filteredTotalScoredVotes).toFixed(1))
        : null;
    const voterBreakdown = participants
      .filter((participant) => memberCanVoteByMemberId[participant.id] ?? false)
      .map((participant) => ({
        id: participant.id,
        name: participant.name,
        role: participant.role,
        score: participant.voteScore,
        isOutlier: Boolean(
          winnerScore && participant.voteScore && participant.voteScore !== winnerScore,
        ),
      }));

    return {
      ritual: {
        id: ritual._id,
        title: ritual.title,
        deckType: ritual.deckType,
      },
      participants,
      voteOptions: deckOptions[ritual.deckType],
      currentVotingSessionId: currentVotingSession?._id ?? null,
      currentVotingSessionStatus: currentVotingSession?.status ?? null,
      currentSessionName: currentTask?.title ?? null,
      currentSessionExternalUrl: currentTask?.externalRef ?? null,
      canManageSessions:
        membership.role === "OWNER" || membership.role === "ADMIN",
      currentUserCanVote: membership.canVote,
      voteProgress: currentVotingSession
        ? {
          submitted: Object.entries(votesByUserId).filter(
            ([userId, hasVoted]) => hasVoted && memberCanVoteByUserId[userId],
          ).length,
          totalVoters: ritualMembers.filter((member) => member.canVote).length,
        }
        : null,
      results: shouldShowResults
        ? {
          finalScore: winnerScore,
          topScores,
          hasTie,
            selectedFinalScore: currentVotingSession?.finalScore ?? null,
          averageScoreIndex,
          agreementPercent,
          totalVotes: filteredTotalScoredVotes,
          distribution: orderedDistribution,
          voterBreakdown,
        }
        : null,
    };
  },
});

export const getRitualAccess = query({
  args: {
    ritualId: v.id("rituals"),
  },
  handler: async (ctx, args) => {
    const ritual = await ctx.db.get(args.ritualId);

    if (!ritual) {
      return {
        ritualExists: false,
        ritualTitle: null,
        isMember: false,
      };
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Public ritual metadata only; membership requires an authenticated identity.
      return {
        ritualExists: true,
        ritualTitle: ritual.title,
        isMember: false,
      };
    }

    const currentUserId = identity.tokenIdentifier;
    const membership = await ctx.db
      .query("ritualMembers")
      .withIndex("by_ritualId_and_userId", (q) =>
        q.eq("ritualId", args.ritualId).eq("userId", currentUserId),
      )
      .unique();

    return {
      ritualExists: true,
      ritualTitle: ritual.title,
      isMember: Boolean(membership),
    };
  },
});

export const createRitual = mutation({
  args: {
    title: v.string(),
    deckType: ritualDeckTypeValidator,
    memberName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const now = Date.now();
    const title = args.title.trim();
    const memberName = args.memberName.trim();

    if (title.length === 0) {
      throw new Error("Session name is required");
    }
    if (memberName.length === 0) {
      throw new Error("Member name is required");
    }

    const ritualId = await ctx.db.insert("rituals", {
      title,
      deckType: args.deckType,
      createdBy: userId,
      createdAt: now,
    });

    await ctx.db.insert("ritualMembers", {
      ritualId,
      userId,
      name: memberName,
      role: "OWNER",
      canVote: true,
      isOnline: true,
      joinedAt: now,
      lastSeenAt: now,
    });

    return { ritualId };
  },
});

export const joinRitual = mutation({
  args: {
    ritualId: v.id("rituals"),
    memberName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const ritual = await ctx.db.get(args.ritualId);
    if (!ritual) {
      throw new Error("Ritual not found");
    }

    const existingMember = await ctx.db
      .query("ritualMembers")
      .withIndex("by_ritualId_and_userId", (q) =>
        q.eq("ritualId", args.ritualId).eq("userId", userId),
      )
      .unique();

    if (existingMember) {
      return { joined: false, alreadyMember: true };
    }
    const memberName = args.memberName.trim();
    if (memberName.length === 0) {
      throw new Error("Member name is required");
    }

    const now = Date.now();
    await ctx.db.insert("ritualMembers", {
      ritualId: args.ritualId,
      userId,
      name: memberName,
      role: "MEMBER",
      canVote: true,
      isOnline: true,
      joinedAt: now,
      lastSeenAt: now,
    });

    return { joined: true, alreadyMember: false };
  },
});

export const updateMyRitualMemberData = mutation({
  args: {
    ritualId: v.id("rituals"),
    memberName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const memberName = args.memberName.trim();
    if (memberName.length === 0) {
      throw new Error("Member name is required");
    }

    const member = await ctx.db
      .query("ritualMembers")
      .withIndex("by_ritualId_and_userId", (q) =>
        q.eq("ritualId", args.ritualId).eq("userId", userId),
      )
      .unique();

    if (!member) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(member._id, {
      name: memberName,
      lastSeenAt: Date.now(),
    });

    return { updated: true };
  },
});

export const manageRitualMember = mutation({
  args: {
    ritualId: v.id("rituals"),
    memberId: v.id("ritualMembers"),
    action: v.union(
      v.literal("KICK"),
      v.literal("SET_READONLY"),
      v.literal("SET_CAN_VOTE"),
      v.literal("SET_ADMIN"),
      v.literal("SET_MEMBER"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const actingMember = await getRitualMember(ctx, args.ritualId, userId);
    requireRitualAdmin(actingMember);

    const targetMember = await ctx.db.get(args.memberId);
    if (!targetMember || targetMember.ritualId !== args.ritualId) {
      throw new Error("Member not found in this ritual");
    }
    if (
      args.action === "KICK" &&
      actingMember.role === "ADMIN" &&
      targetMember.role === "OWNER"
    ) {
      throw new Error("Admins cannot kick the ritual owner");
    }
    if (targetMember.role === "OWNER" && args.action === "KICK") {
      throw new Error("Cannot manage ritual owner");
    }
    if (targetMember.userId === actingMember.userId && args.action === "KICK") {
      throw new Error("Use your own member settings");
    }

    const pendingSession = await ctx.db
      .query("votingSessions")
      .withIndex("by_ritualId_and_status", (q) =>
        q.eq("ritualId", args.ritualId).eq("status", "PENDING"),
      )
      .take(1);
    const activePendingSession = pendingSession[0] ?? null;

    switch (args.action) {
      case "KICK":
        await ctx.db.delete(targetMember._id);
        return { success: true, action: "KICK" as const };
      case "SET_READONLY": {
        await ctx.db.patch(targetMember._id, {
          canVote: false,
          lastSeenAt: Date.now(),
        });

        if (activePendingSession) {
          const vote = await ctx.db
            .query("votes")
            .withIndex("by_sessionId_and_userId", (q) =>
              q.eq("sessionId", activePendingSession._id).eq("userId", targetMember.userId),
            )
            .unique();

          if (vote) {
            await ctx.db.patch(vote._id, {
              score: null,
              hasVoted: false,
              voteStatus: "PRONTO",
              votedAt: undefined,
            });
          } else {
            await ctx.db.insert("votes", {
              sessionId: activePendingSession._id,
              userId: targetMember.userId,
              score: null,
              hasVoted: false,
              voteStatus: "PRONTO",
            });
          }
        }

        return { success: true, action: "SET_READONLY" as const };
      }
      case "SET_CAN_VOTE": {
        await ctx.db.patch(targetMember._id, {
          canVote: true,
          lastSeenAt: Date.now(),
        });

        if (activePendingSession) {
          const vote = await ctx.db
            .query("votes")
            .withIndex("by_sessionId_and_userId", (q) =>
              q.eq("sessionId", activePendingSession._id).eq("userId", targetMember.userId),
            )
            .unique();

          if (vote) {
            await ctx.db.patch(vote._id, {
              score: null,
              hasVoted: false,
              voteStatus: "PENSANDO",
              votedAt: undefined,
            });
          } else {
            await ctx.db.insert("votes", {
              sessionId: activePendingSession._id,
              userId: targetMember.userId,
              score: null,
              hasVoted: false,
              voteStatus: "PENSANDO",
            });
          }
        }

        return { success: true, action: "SET_CAN_VOTE" as const };
      }
      case "SET_ADMIN": {
        if (targetMember.role === "OWNER") {
          throw new Error("Cannot change ritual owner role");
        }

        await ctx.db.patch(targetMember._id, {
          role: "ADMIN",
          lastSeenAt: Date.now(),
        });

        return { success: true, action: "SET_ADMIN" as const };
      }
      case "SET_MEMBER": {
        if (targetMember.role === "OWNER") {
          throw new Error("Cannot change ritual owner role");
        }

        await ctx.db.patch(targetMember._id, {
          role: "MEMBER",
          lastSeenAt: Date.now(),
        });

        return { success: true, action: "SET_MEMBER" as const };
      }
      default:
        throw new Error("Unsupported management action");
    }
  },
});

export const submitVote = mutation({
  args: {
    sessionId: v.id("votingSessions"),
    score: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const session = await getSessionOrThrow(ctx, args.sessionId);
    requireOpenStatus(session.status);
    const ritual = await ctx.db.get(session.ritualId);
    if (!ritual) {
      throw new Error("Ritual not found");
    }

    const member = await getRitualMember(ctx, session.ritualId, userId);
    if (!member.canVote) {
      throw new Error("Unauthorized");
    }

    requireValidScore(ritual.deckType, args.score);

    const now = Date.now();

    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_sessionId_and_userId", (q) =>
        q.eq("sessionId", args.sessionId).eq("userId", userId),
      )
      .unique();

    if (existingVote) {
      await ctx.db.patch(existingVote._id, {
        score: args.score,
        hasVoted: true,
        voteStatus: "VOTADO",
        votedAt: now,
      });
    } else {
      await ctx.db.insert("votes", {
        sessionId: args.sessionId,
        userId,
        score: args.score,
        hasVoted: true,
        voteStatus: "VOTADO",
        votedAt: now,
      });
    }

    let revealed = false;

    if (session.autoRevealWhenAllVoted) {
      const voterCount = await countVotersInRitual(ctx, session.ritualId);
      const submittedVotes = await countSubmittedVotes(ctx, session);

      if (voterCount > 0 && submittedVotes >= voterCount) {
        await ctx.db.patch(session._id, {
          status: "REVEALED",
          revealedAt: now,
        });
        revealed = true;
      }
    }

    return { revealed };
  },
});

export const setVoteThinkingStatus = mutation({
  args: {
    sessionId: v.id("votingSessions"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const session = await getSessionOrThrow(ctx, args.sessionId);
    requireOpenStatus(session.status);
    if (session.status !== "PENDING") {
      throw new Error("Only pending sessions can update vote status");
    }

    const member = await getRitualMember(ctx, session.ritualId, userId);
    if (!member.canVote) {
      throw new Error("Unauthorized");
    }

    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_sessionId_and_userId", (q) =>
        q.eq("sessionId", args.sessionId).eq("userId", userId),
      )
      .unique();

    if (existingVote) {
      await ctx.db.patch(existingVote._id, {
        hasVoted: false,
        voteStatus: "PENSANDO",
      });
    } else {
      await ctx.db.insert("votes", {
        sessionId: args.sessionId,
        userId,
        score: null,
        hasVoted: false,
        voteStatus: "PENSANDO",
      });
    }

    return { status: "PENSANDO" as const };
  },
});

export const revealVotingSession = mutation({
  args: {
    sessionId: v.id("votingSessions"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const session = await getSessionOrThrow(ctx, args.sessionId);
    const member = await getRitualMember(ctx, session.ritualId, userId);
    requireRitualAdmin(member);

    if (session.status === "REVEALED" || session.status === "DONE") {
      return { status: session.status };
    }

    requireOpenStatus(session.status);
    await assertAllVotesSubmitted(ctx, session);

    await ctx.db.patch(session._id, {
      status: "REVEALED",
      revealedAt: Date.now(),
    });

    return { status: "REVEALED" as const };
  },
});

export const finalizeVotingSession = mutation({
  args: {
    sessionId: v.id("votingSessions"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const session = await getSessionOrThrow(ctx, args.sessionId);
    const member = await getRitualMember(ctx, session.ritualId, userId);
    requireRitualAdmin(member);

    if (session.status === "DONE" || session.status === "CANCELLED") {
      const task = await ctx.db.get(session.taskId);
      return {
        status: session.status,
        clickUpId: task?.clickUpId ?? null,
        clickUpScoreValue: session.finalScore ?? null,
      };
    }

    requireOpenStatus(session.status);
    await assertAllVotesSubmitted(ctx, session);

    await ctx.db.patch(session._id, {
      status: "DONE",
      closedAt: Date.now(),
    });

    return { status: "DONE" as const };
  },
});

export const closeVotingSessionInternal = internalMutation({
  args: {
    sessionId: v.id("votingSessions"),
    finalScore: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const session = await getSessionOrThrow(ctx, args.sessionId);
    const member = await getRitualMember(ctx, session.ritualId, userId);
    requireRitualAdmin(member);

    if (session.status === "DONE" || session.status === "CANCELLED") {
      const task = await ctx.db.get(session.taskId);
      return {
        status: session.status,
        clickUpId: task?.clickUpId ?? null,
        clickUpScoreValue: session.finalScore ?? null,
      };
    }

    if (session.status !== "REVEALED") {
      throw new Error("Only revealed sessions can be closed");
    }

    const ritual = await ctx.db.get(session.ritualId);
    if (!ritual) {
      throw new Error("Ritual not found");
    }

    requireValidScore(ritual.deckType, args.finalScore);

    const task = await ctx.db.get(session.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    await ctx.db.patch(session._id, {
      status: "DONE",
      finalScore: args.finalScore,
      closedAt: Date.now(),
    });

    return {
      status: "DONE" as const,
      clickUpId: task.clickUpId ?? null,
      clickUpScoreValue: resolveClickUpScoreValue(ritual.deckType, args.finalScore),
    };
  },
});

export const closeVotingSession = action({
  args: {
    sessionId: v.id("votingSessions"),
    finalScore: v.string(),
  },
  handler: async (ctx, args) => {
    const result: {
      status: "DONE" | "CANCELLED";
      clickUpId: string | null;
      clickUpScoreValue: string | null;
    } = await ctx.runMutation(internal.ritualVoting.closeVotingSessionInternal, {
      sessionId: args.sessionId,
      finalScore: args.finalScore,
    });

    if (result.status === "DONE" && result.clickUpId && result.clickUpScoreValue) {
      await ctx.runAction(api.clickup.setClickUpCustomFieldValue, {
        taskId: result.clickUpId,
        value: result.clickUpScoreValue,
      });
    }

    return { status: result.status };
  },
});

export const reopenVotingSession = mutation({
  args: {
    sessionId: v.id("votingSessions"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const session = await getSessionOrThrow(ctx, args.sessionId);
    const member = await getRitualMember(ctx, session.ritualId, userId);
    requireRitualAdmin(member);

    if (session.status !== "REVEALED") {
      throw new Error("Only revealed sessions can be reopened");
    }

    const pendingSession = await ctx.db
      .query("votingSessions")
      .withIndex("by_ritualId_and_status", (q) =>
        q.eq("ritualId", session.ritualId).eq("status", "PENDING"),
      )
      .take(1);

    if (pendingSession.length > 0 && pendingSession[0]._id !== session._id) {
      throw new Error("Ritual already has another pending voting session");
    }

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", session._id))
      .collect();

    for (const vote of votes) {
      await ctx.db.patch(vote._id, {
        score: null,
        hasVoted: false,
        voteStatus: "PENSANDO",
        votedAt: undefined,
      });
    }

    await ctx.db.patch(session._id, {
      status: "PENDING",
      finalScore: undefined,
    });

    return { status: "PENDING" as const };
  },
});
