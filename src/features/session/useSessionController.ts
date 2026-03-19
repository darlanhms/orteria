import { useMemo, useState } from "react"

import type {
  MockVoteOptionId,
  SessionParticipant,
  SessionStats,
  SessionVoteOption,
} from "@/data/mockData"
import { getMockSessionById } from "@/data/mockData"

export type SessionMode = "voting" | "revealed"

export function useSessionController(sessionId: string) {
  const session = useMemo(() => getMockSessionById(sessionId), [sessionId])

  const [selectedVoteId, setSelectedVoteId] = useState<MockVoteOptionId | null>(
    null,
  )
  const [mode, setMode] = useState<SessionMode>("voting")

  const isRevealed = mode === "revealed"

  const handleSelectVote = (voteId: MockVoteOptionId) => {
    if (isRevealed) return
    setSelectedVoteId(voteId)
  }

  const handleRevealVotes = () => {
    setMode("revealed")
  }

  const handleResetRound = () => {
    setSelectedVoteId(null)
    setMode("voting")
  }

  return {
    // derived
    session,
    isRevealed,
    selectedVoteId,

    // constants (mocked)
    voteOptions: session.voteOptions,
    participants: session.participants,
    stats: session.stats,

    // handlers
    handleSelectVote,
    handleRevealVotes,
    handleResetRound,
  }
}

export type { SessionVoteOption }
export type { MockVoteOptionId }
export type { SessionParticipant }
export type { SessionStats }

