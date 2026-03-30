import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

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
    { id: "RN", label: "RN", sizingLabel: "EXTRA PEQUENO" },
    { id: "PP", label: "PP", sizingLabel: "PEQUENO" },
    { id: "P", label: "P", sizingLabel: "MÉDIO-PEQUENO" },
    { id: "M", label: "M", sizingLabel: "MÉDIO" },
    { id: "G", label: "G", sizingLabel: "GRANDE" },
    { id: "GG", label: "GG", sizingLabel: "EXTRA GRANDE" },
    { id: "XGG", label: "XGG", sizingLabel: "ÉPICO" },
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
  sessionId: Id<"votingSessions">,
): Promise<number> {
  let count = 0;
  const votesQuery = ctx.db
    .query("votes")
    .withIndex("by_sessionId_and_hasVoted", (q) =>
      q.eq("sessionId", sessionId).eq("hasVoted", true),
    );

  for await (const _vote of votesQuery) {
    count += 1;
  }

  return count;
}

async function countSubmittedVotesQuery(
  ctx: QueryCtx,
  sessionId: Id<"votingSessions">,
): Promise<number> {
  let count = 0;
  const votesQuery = ctx.db
    .query("votes")
    .withIndex("by_sessionId_and_hasVoted", (q) =>
      q.eq("sessionId", sessionId).eq("hasVoted", true),
    );

  for await (const _vote of votesQuery) {
    count += 1;
  }

  return count;
}

async function countVotersInRitualQuery(
  ctx: QueryCtx,
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

async function assertAllVotesSubmitted(
  ctx: MutationCtx,
  session: Doc<"votingSessions">,
): Promise<void> {
  const voterCount = await countVotersInRitual(ctx, session.ritualId);
  const submittedVotes = await countSubmittedVotes(ctx, session._id);
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

    if (currentVotingSession) {
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", currentVotingSession._id))
        .collect();

      for (const vote of votes) {
        votesByUserId[vote.userId] = vote.hasVoted;
      }
    }

    const currentTask = currentVotingSession
      ? await ctx.db.get(currentVotingSession.taskId)
      : null;

    const ritualMembers = await ctx.db
      .query("ritualMembers")
      .withIndex("by_ritualId", (q) => q.eq("ritualId", args.ritualId))
      .collect();

    const participants = ritualMembers.map((member) => {
      const hasVoted = votesByUserId[member.userId] ?? false;
      const status: "PRONTO" | "PENSANDO..." | "VOTADO" = member.canVote
        ? hasVoted
          ? "VOTADO"
          : currentVotingSession?.status === "PENDING"
            ? "PENSANDO..."
            : "PRONTO"
        : "PRONTO";

      const displayName =
        member.userId === currentUserId
          ? "Você"
          : `Membro ${member.userId.slice(0, 6)}`;

      return {
        id: member._id,
        name: displayName,
        role: member.canVote ? member.role : `${member.role} (Espectador)`,
        status,
      };
    });

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
      voteProgress: currentVotingSession
        ? {
            submitted: await countSubmittedVotesQuery(ctx, currentVotingSession._id),
            totalVoters: await countVotersInRitualQuery(ctx, args.ritualId),
          }
        : null,
    };
  },
});

export const createRitual = mutation({
  args: {
    title: v.string(),
    deckType: ritualDeckTypeValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const now = Date.now();
    const title = args.title.trim();

    if (title.length === 0) {
      throw new Error("Session name is required");
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
      role: "OWNER",
      canVote: true,
      isOnline: true,
      joinedAt: now,
      lastSeenAt: now,
    });

    return { ritualId };
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
        votedAt: now,
      });
    } else {
      await ctx.db.insert("votes", {
        sessionId: args.sessionId,
        userId,
        score: args.score,
        hasVoted: true,
        votedAt: now,
      });
    }

    let revealed = false;

    if (session.autoRevealWhenAllVoted) {
      const voterCount = await countVotersInRitual(ctx, session.ritualId);
      const submittedVotes = await countSubmittedVotes(ctx, args.sessionId);

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

export const closeVotingSession = mutation({
  args: {
    sessionId: v.id("votingSessions"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuthenticatedUser(ctx);
    const session = await getSessionOrThrow(ctx, args.sessionId);
    const member = await getRitualMember(ctx, session.ritualId, userId);
    requireRitualAdmin(member);

    if (session.status === "DONE" || session.status === "CANCELLED") {
      return { status: session.status };
    }

    if (session.status !== "REVEALED") {
      throw new Error("Only revealed sessions can be closed");
    }

    await ctx.db.patch(session._id, {
      status: "DONE",
      closedAt: Date.now(),
    });

    return { status: "DONE" as const };
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
      });
    }

    await ctx.db.patch(session._id, {
      status: "PENDING",
    });

    return { status: "PENDING" as const };
  },
});
