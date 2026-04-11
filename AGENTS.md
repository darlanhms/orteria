<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

# First Instruction

- Whenever you change code that affects business rules and are absolute essential for the functioning of the system, you must update this `AGENTS.md` file in the same task so the documented rules stay in sync with implementation.
DO NOT UPDATE THIS FILE WHENEVER A SMALL UI CHANGE OCCURS.

# Auth logic
- This app uses convex + better auth using the setup created on this url https://labs.convex.dev/better-auth/framework-guides/tanstack-start
- NEVER use auth related functions from convex directly
- Every auth implementation should use better auth

# Business Rules (Ritual Voting)

This section documents the functional rules agreed during product implementation.

## Core Session Flow

- A ritual can have only one active `PENDING` voting session at a time.
- Session flow is:
  - `PENDING` (members vote)
  - `REVEALED` (results screen and final score decision)
  - `DONE` (closed/finalized)
- Leaders/Admins can:
  - create new voting sessions,
  - reveal votes,
  - reopen a revealed session for re-vote,
  - finalize the session.
- After finalizing (`DONE`), users return to the normal session workflow (new session creation path), not the revealed result state.

## Authentication and Access

- Session screen must only render for authenticated users.
- Convex queries that need `ctx.auth` must not run until the Convex client has finished loading the JWT from Better Auth (`useConvexAuth`: wait for `!isLoading && isAuthenticated` before enabling subscriptions).
- `getRitualAccess` may run without a Convex identity: it still returns whether the ritual exists and its title, with `isMember: false` when unauthenticated (membership is only resolved when an identity is present).
- The `/session/:sessionId` route param must be a valid Convex document id for the `rituals` table; validate on the client (`isConvexDocumentId`) before calling queries so arbitrary URL segments do not trigger `ArgumentValidationError` on `v.id("rituals")`.
- If a user opens a ritual URL and is not a member, show a join flow.
- Join flow must include ritual title and require a ritual-specific display name.

## Member Roles and Management

- Roles are `OWNER`, `ADMIN`, and `MEMBER`.
- Management permissions come from role (`OWNER`/`ADMIN`), not from voting capability.
- Owner/Admin can manage members through member actions.
- Member management must be generic and action-based (not a single-purpose UI).
- Current supported management actions:
  - `KICK`
  - `SET_READONLY`
  - `SET_CAN_VOTE`
- Actions requiring confirmation (destructive or impactful) must use a confirmation dialog.
- The owner cannot be kicked.
- Self-kick is not allowed.
- Leader/Admin self-management for read-only mode is allowed.

## Read-Only Mode

- Read-only mode is represented by `canVote: false`.
- Read-only users:
  - cannot submit votes,
  - cannot change vote-thinking state,
  - are treated as spectators in voting logic,
  - are excluded from vote counts and score aggregates.
- Read-only leader/admin:
  - keeps all management powers (create, reveal, finalize, member management),
  - is restricted only in scoring/voting behavior.
- UI must separate members into:
  - `Participants` (can vote),
  - `Spectators` (read-only),
  in both voting and results views for easier validation.

## Voting Behavior

- While session is `PENDING`, voter statuses are:
  - `PENSANDO`, `VOTADO`, `PRONTO` (contextual).
- If a voter already voted and selects a different option before submitting again, status must return to `PENSANDO`.
- Reveal is allowed only when:
  - all eligible voters have voted,
  - no eligible participant is still `PENSANDO`.
- For non-managers, when everyone has voted, progress label should show “Waiting for reveal” behavior (instead of raw fraction display).

## Results and Final Score

- Results screen appears after reveal.
- Tie handling:
  - when top counts are equal, do not force a single winner,
  - highlight all tied top options,
  - show per-option vote percentage as integer.
- Final score selection is explicit:
  - manager selects the final score before finalization,
  - if a single option clearly wins, preselect it by default,
  - if unresolved (e.g., tie and no choice), final score is `N/A`.
- Finalization requires a selected final score.

## ClickUp Integration

- Voting session task may have an `externalUrl` and `clickUpId`.
- If `clickUpId` exists on finalize:
  - send final score to ClickUp custom field automatically.
- Score payload sent to ClickUp may use mapped option values (for deck-specific options such as T-Shirt) rather than raw label.
- ClickUp API key/field handling must stay server-side (Convex action), never in client code.

## UX and Copy Rules

- All fixed UI labels for this flow should be in Brazilian Portuguese.
- Keep navbar/branding customizations untouched when applying session UI changes.
- Member self-edit dialog should be extensible as a general member data form (future options beyond name).

## Code logic rules
- When a component is doing too much and out of it's own scope, break it into multiple components.
- If a screen has a lot of complex logic, create a hook for that screen and use it for separate components inside that screen and try to break logic into the smaller components, also put the core logic inside the screen hook and use it on individual components instead of receiving a lot of props.
- Avoid props hell at any cost, do not create components that receive a lot of props.
