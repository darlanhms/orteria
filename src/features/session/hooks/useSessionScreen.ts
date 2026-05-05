import { useEffect, useState } from "react"
import { convexQuery, useConvexAction, useConvexMutation } from "@convex-dev/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useConvexAuth } from "convex/react"
import { isConvexDocumentId } from "@/lib/convexDocumentId"
import type { RitualMemberManagementTarget } from "../components/ManageRitualMemberDialog"
import type { MemberManagementAction, SessionParticipant } from "../components/ParticipantsPanel"
import type { Id } from "~convex/_generated/dataModel"

import { api } from "~convex/_generated/api"

export interface UseSessionScreenArgs {
  readonly sessionId: string
}

export function useSessionScreen({ sessionId }: UseSessionScreenArgs) {
  const navigate = useNavigate()
  const { isLoading: isConvexAuthLoading, isAuthenticated: isConvexAuthenticated } =
    useConvexAuth()
  const isRitualIdParamValid = isConvexDocumentId(sessionId)
  const ritualId = sessionId as Id<"rituals">
  const [selectedVote, setSelectedVote] = useState<string | null>(null)
  const [joinMemberName, setJoinMemberName] = useState("")
  const [initialMemberNameForEdit, setInitialMemberNameForEdit] = useState("")
  const [isEditMemberNameOpen, setIsEditMemberNameOpen] = useState(false)
  const [isConfirmKickOpen, setIsConfirmKickOpen] = useState(false)
  const [memberActionToConfirm, setMemberActionToConfirm] = useState<MemberManagementAction | null>(null)
  const [memberToManage, setMemberToManage] = useState<RitualMemberManagementTarget | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedFinalScoreForClose, setSelectedFinalScoreForClose] = useState<string | null>(null)
  const [hasDismissedAutoModal, setHasDismissedAutoModal] = useState(false)

  const submitVote = useMutation({
    mutationFn: useConvexMutation(api.ritualVoting.submitVote),
  })
  const setVoteThinkingStatus = useMutation({
    mutationFn: useConvexMutation(api.ritualVoting.setVoteThinkingStatus),
  })
  const revealVotingSession = useMutation({
    mutationFn: useConvexMutation(api.ritualVoting.revealVotingSession),
  })
  const reopenVotingSession = useMutation({
    mutationFn: useConvexMutation(api.ritualVoting.reopenVotingSession),
  })
  const closeVotingSession = useMutation({
    mutationFn: useConvexAction(api.ritualVoting.closeVotingSession),
  })
  const joinRitual = useMutation({
    mutationFn: useConvexMutation(api.ritualVoting.joinRitual),
  })

  const {
    data: ritualAccessData,
    isPending: isAccessPending,
    isError: isAccessError,
    error: accessError,
  } = useQuery(
    {
      ...convexQuery(api.ritualVoting.getRitualAccess, {
        ritualId,
      }),
      // Wait until Better Auth → Convex JWT is ready; avoids "Not authenticated" while the token is still loading.
      // Skip Convex entirely if the route param is not a valid document id (prevents ArgumentValidationError).
      enabled:
        isRitualIdParamValid && !isConvexAuthLoading && isConvexAuthenticated,
    },
  )
  const { data: sessionData, isPending, isError, error } = useQuery(
    {
      ...convexQuery(api.ritualVoting.getSessionScreenData, {
        ritualId,
      }),
      enabled:
        isRitualIdParamValid &&
        !isConvexAuthLoading &&
        isConvexAuthenticated &&
        ritualAccessData?.isMember === true,
    },
  )

  useEffect(() => {
    if (!sessionData) {
      return
    }

    if (sessionData.currentVotingSessionId) {
      setHasDismissedAutoModal(false)
      setIsCreateModalOpen(false)
      return
    }

    if (sessionData.canManageSessions && !hasDismissedAutoModal) {
      setIsCreateModalOpen(true)
    }
  }, [sessionData, hasDismissedAutoModal])

  useEffect(() => {
    if (
      !sessionData ||
      sessionData.currentVotingSessionStatus !== "REVEALED" ||
      !sessionData.currentVotingSessionId ||
      !sessionData.results
    ) {
      setSelectedFinalScoreForClose(null)
      return
    }

    setSelectedFinalScoreForClose(
      sessionData.results.selectedFinalScore ?? sessionData.results.finalScore ?? null,
    )
  }, [sessionData])

  const data = sessionData ?? null
  const voterParticipants = data?.participants.filter((participant) => participant.canVote) ?? []
  const spectatorParticipants = data?.participants.filter((participant) => !participant.canVote) ?? []
  const currentUserCanVote = data?.currentUserCanVote ?? false
  const currentUserParticipant =
    data?.participants.find((participant) => participant.isCurrentUser) ?? null
  const hasCurrentUserVoted = currentUserParticipant?.status === "VOTADO"
  const currentVotingSessionId = data?.currentVotingSessionId ?? null

  useEffect(() => {
    setSelectedVote(null)
  }, [currentVotingSessionId])

  useEffect(() => {
    if (selectedVote !== null) {
      return
    }
    if (currentUserParticipant?.status !== "VOTADO") {
      return
    }
    if (!currentUserParticipant.voteScore) {
      return
    }
    setSelectedVote(currentUserParticipant.voteScore)
  }, [currentUserParticipant, selectedVote])

  const isVotingOpen =
    data?.currentVotingSessionStatus === "PENDING" &&
    Boolean(data.currentVotingSessionId) &&
    currentUserCanVote &&
    !submitVote.isPending
  const hasChangedVoteSelection =
    Boolean(selectedVote) &&
    (!hasCurrentUserVoted || selectedVote !== (currentUserParticipant?.voteScore ?? null))
  const canSubmitVote = isVotingOpen && hasChangedVoteSelection
  const allVotesSubmitted =
    (data?.voteProgress?.totalVoters ?? 0) > 0 &&
    (data?.voteProgress?.submitted ?? 0) >= (data?.voteProgress?.totalVoters ?? 0)
  const hasAnyParticipantThinking = voterParticipants.some(
    (participant) => participant.status === "PENSANDO",
  )
  const canRevealNow =
    Boolean(data?.canManageSessions) &&
    Boolean(data?.currentVotingSessionId) &&
    data?.currentVotingSessionStatus === "PENDING" &&
    allVotesSubmitted &&
    !hasAnyParticipantThinking
  const results = data?.results ?? null
  const isShowingResults =
    (data?.currentVotingSessionStatus === "REVEALED" ||
      data?.currentVotingSessionStatus === "DONE") &&
    Boolean(results)

  function handleEditSelfName(currentName: string) {
    setInitialMemberNameForEdit(currentName)
    setIsEditMemberNameOpen(true)
  }

  function handleManageMember(participant: SessionParticipant, action: MemberManagementAction) {
    setMemberToManage({
      id: participant.id,
      name: participant.name,
      role: participant.role,
    })
    setMemberActionToConfirm(action)
    setIsConfirmKickOpen(true)
  }

  function handleResetMemberManagement() {
    setMemberToManage(null)
    setMemberActionToConfirm(null)
  }

  function handleSubmitVote() {
    if (!canSubmitVote || !selectedVote || !data?.currentVotingSessionId) {
      return
    }

    submitVote.reset()
    submitVote.mutate({
      sessionId: data.currentVotingSessionId,
      score: selectedVote,
    })
  }

  function handleCreateModalOpenChange(open: boolean) {
    setIsCreateModalOpen(open)
    if (!open && data?.canManageSessions && !data.currentVotingSessionId) {
      setHasDismissedAutoModal(true)
    }
  }

  function handleOpenCreateSessionModal() {
    setHasDismissedAutoModal(false)
    setIsCreateModalOpen(true)
  }

  function handleSelectVote(voteId: string) {
    if (!currentUserCanVote) {
      return
    }
    setSelectedVote(voteId)

    if (
      !data?.currentVotingSessionId ||
      data.currentVotingSessionStatus !== "PENDING" ||
      currentUserParticipant?.status !== "VOTADO" ||
      voteId === (currentUserParticipant.voteScore ?? null)
    ) {
      return
    }

    if (setVoteThinkingStatus.isPending) {
      return
    }

    setVoteThinkingStatus.reset()
    setVoteThinkingStatus.mutate({
      sessionId: data.currentVotingSessionId,
    })
  }

  function handleRevealVotingSession() {
    if (!data?.currentVotingSessionId || !canRevealNow) {
      return
    }

    revealVotingSession.reset()
    revealVotingSession.mutate({
      sessionId: data.currentVotingSessionId,
    })
  }

  function handleReVote() {
    if (!data?.currentVotingSessionId || data.currentVotingSessionStatus !== "REVEALED") {
      return
    }
    reopenVotingSession.reset()
    reopenVotingSession.mutate({
      sessionId: data.currentVotingSessionId,
    })
  }

  function handleFinalizeScore() {
    if (!data?.currentVotingSessionId || data.currentVotingSessionStatus !== "REVEALED") {
      return
    }
    if (!selectedFinalScoreForClose) {
      return
    }
    closeVotingSession.reset()
    closeVotingSession.mutate({
      sessionId: data.currentVotingSessionId,
      finalScore: selectedFinalScoreForClose,
    })
  }

  function handleJoinRitual() {
    joinRitual.reset()
    joinRitual.mutate({
      ritualId,
      memberName: joinMemberName,
    })
  }

  return {
    ids: { sessionId, ritualId, isRitualIdParamValid },
    convexAuth: {
      isLoading: isConvexAuthLoading,
      isAuthenticated: isConvexAuthenticated,
    },
    access: {
      ritualAccessData,
      isAccessPending,
      isAccessError,
      accessError,
    },
    session: {
      sessionData,
      data,
      isPending,
      isError,
      error,
      isShowingResults,
      results,
    },
    derived: {
      voterParticipants,
      spectatorParticipants,
      currentUserParticipant,
      currentUserCanVote,
      hasCurrentUserVoted,
      isVotingOpen,
      canSubmitVote,
      allVotesSubmitted,
      canRevealNow,
    },
    ui: {
      selectedVote,
      setSelectedVote,
      joinMemberName,
      setJoinMemberName,
      initialMemberNameForEdit,
      isEditMemberNameOpen,
      setIsEditMemberNameOpen,
      isConfirmKickOpen,
      setIsConfirmKickOpen,
      memberActionToConfirm,
      memberToManage,
      isCreateModalOpen,
      selectedFinalScoreForClose,
      setSelectedFinalScoreForClose,
      setHasDismissedAutoModal,
    },
    mutations: {
      submitVote,
      setVoteThinkingStatus,
      revealVotingSession,
      reopenVotingSession,
      closeVotingSession,
      joinRitual,
    },
    actions: {
      navigate,
      handleEditSelfName,
      handleManageMember,
      handleResetMemberManagement,
      handleSubmitVote,
      handleCreateModalOpenChange,
      handleOpenCreateSessionModal,
      handleSelectVote,
      handleRevealVotingSession,
      handleReVote,
      handleFinalizeScore,
      handleJoinRitual,
    },
  }
}

/** Full screen model from {@link useSessionScreen}; pass a single `screen` prop to session sub-views to avoid prop drilling. */
export type SessionScreenModel = ReturnType<typeof useSessionScreen>
