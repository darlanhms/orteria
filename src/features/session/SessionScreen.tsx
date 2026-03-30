import { useEffect, useState } from "react"
import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { EditRitualMemberDataDialog } from "./components/EditRitualMemberDataDialog"
import { ParticipantsPanel } from "./components/ParticipantsPanel"
import { NewVotingSessionModal } from "./components/NewVotingSessionModal"
import { VoteOptionCard } from "./components/VoteOptionCard"
import type { SessionVoteOption } from "./components/VoteOptionCard"
import type { Id } from "~convex/_generated/dataModel"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TopNavBar } from "@/features/lobby/components/TopNavBar"
import { api } from "~convex/_generated/api"

// DONT DELETE THIS IT IS FOR LATER USE
// {
//   "id": "ce068f1d-da75-4a00-90d2-75d1fce9fdb5",
//   "name": "Previsto",
//   "type": "drop_down",
//   "type_config": {
//       "default": 0,
//       "sorting": "manual",
//       "placeholder": null,
//       "new_drop_down": true,
//       "options": [
//           {
//               "id": "c8a84df7-0957-476d-9ddf-afadfa3aad88",
//               "name": "RN",
//               "color": null,
//               "orderindex": 0
//           },
//           {
//               "id": "77ed47da-ddb9-4d60-a13e-0884f7e6ed36",
//               "name": "PP",
//               "color": null,
//               "orderindex": 1
//           },
//           {
//               "id": "c97dcbcf-4831-4a3d-8a32-d82d6bae7d11",
//               "name": "P",
//               "color": null,
//               "orderindex": 2
//           },
//           {
//               "id": "003ab98d-124b-4137-92b7-dd5652732e74",
//               "name": "M",
//               "color": null,
//               "orderindex": 3
//           },
//           {
//               "id": "ac6dffd3-dc67-4146-89ed-0dfed8d534d7",
//               "name": "G",
//               "color": null,
//               "orderindex": 4
//           },
//           {
//               "id": "61c44ebf-6e61-4a80-b590-b1563ee901a3",
//               "name": "GG",
//               "color": null,
//               "orderindex": 5
//           },
//           {
//               "id": "a5239881-574a-464d-8d84-d0dd6ccb37d4",
//               "name": "XGG",
//               "color": null,
//               "orderindex": 6
//           }
//       ]
//   },
//   "date_created": "1697548638781",
//   "hide_from_guests": false,
//   "required": false
// }

export interface SessionScreenProps {
  readonly sessionId: string
}

function VoteGrid({
  voteOptions,
  selectedVote,
  onSelectVote,
  isVotingOpen,
}: {
  readonly voteOptions: ReadonlyArray<SessionVoteOption>
  readonly selectedVote: string | null
  readonly onSelectVote: (voteId: string) => void
  readonly isVotingOpen: boolean
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {voteOptions.map((opt) => (
        <VoteOptionCard
          key={opt.id}
          option={opt}
          isSelected={selectedVote === opt.id}
          isDisabled={!isVotingOpen}
          onSelect={() => onSelectVote(opt.id)}
        />
      ))}
    </div>
  )
}

export function SessionScreen({
  sessionId,
}: SessionScreenProps) {
  const navigate = useNavigate()
  const [selectedVote, setSelectedVote] = useState<string | null>(null)
  const [joinMemberName, setJoinMemberName] = useState("")
  const [initialMemberNameForEdit, setInitialMemberNameForEdit] = useState("")
  const [isEditMemberNameOpen, setIsEditMemberNameOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedFinalScoreForClose, setSelectedFinalScoreForClose] = useState<string | null>(null)
  const [hasDismissedAutoModal, setHasDismissedAutoModal] = useState(false)
  const submitVote = useMutation({
    mutationFn: useConvexMutation(api.ritualVoting.submitVote),
    onSuccess: () => {
      setSelectedVote(null)
    },
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
    mutationFn: useConvexMutation(api.ritualVoting.closeVotingSession),
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
    convexQuery(api.ritualVoting.getRitualAccess, {
      ritualId: sessionId as Id<"rituals">,
    }),
  )
  const { data: sessionData, isPending, isError, error } = useQuery(
    {
      ...convexQuery(api.ritualVoting.getSessionScreenData, {
        ritualId: sessionId as Id<"rituals">,
      }),
      enabled: ritualAccessData?.isMember === true,
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

  if (isAccessPending) {
    return (
      <div className="min-h-svh bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Carregando sessão...</p>
      </div>
    )
  }

  if (isAccessError) {
    return (
      <div className="min-h-svh bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">{accessError.message}</p>
      </div>
    )
  }

  if (!ritualAccessData?.ritualExists) {
    return (
      <div className="min-h-svh bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Sessão não encontrada.</p>
      </div>
    )
  }

  if (!ritualAccessData.isMember) {
    return (
      <div className="min-h-svh bg-background text-foreground">
        <TopNavBar ritualName={ritualAccessData.ritualTitle} />
        <Dialog open>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Entrar neste ritual?</DialogTitle>
              <DialogDescription>
                Você ainda não participa do ritual{" "}
                <span className="font-semibold text-foreground">
                  "{ritualAccessData.ritualTitle}"
                </span>
                . Deseja entrar como membro?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <label htmlFor="join-member-name" className="text-sm font-medium">
                Nome no ritual
              </label>
              <input
                id="join-member-name"
                value={joinMemberName}
                onChange={(event) => setJoinMemberName(event.target.value)}
                placeholder="Ex: Darlan"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            {joinRitual.error && (
              <p className="text-sm text-destructive">{joinRitual.error.message}</p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/" })}
                disabled={joinRitual.isPending}
              >
                Agora não
              </Button>
              <Button
                onClick={() => {
                  joinRitual.reset()
                  joinRitual.mutate({
                    ritualId: sessionId as Id<"rituals">,
                    memberName: joinMemberName,
                  })
                }}
                disabled={joinRitual.isPending || joinMemberName.trim().length === 0}
              >
                {joinRitual.isPending ? "Entrando..." : "Entrar no ritual"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="min-h-svh bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Carregando sessão...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-svh bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  if (sessionData === null) {
    return (
      <div className="min-h-svh bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Sessão não encontrada.</p>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="min-h-svh bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Falha ao carregar a sessão.</p>
      </div>
    )
  }

  const data = sessionData
  const isVotingOpen =
    data.currentVotingSessionStatus === "PENDING" &&
    Boolean(data.currentVotingSessionId) &&
    !submitVote.isPending
  const allVotesSubmitted =
    (data.voteProgress?.totalVoters ?? 0) > 0 &&
    (data.voteProgress?.submitted ?? 0) >= (data.voteProgress?.totalVoters ?? 0)
  const currentUserParticipant = data.participants.find((participant) => participant.isCurrentUser) ?? null
  const hasCurrentUserVoted = currentUserParticipant?.status === "VOTADO"
  const hasAnyParticipantThinking = data.participants.some(
    (participant) => participant.status === "PENSANDO",
  )
  const canRevealNow =
    data.canManageSessions &&
    Boolean(data.currentVotingSessionId) &&
    data.currentVotingSessionStatus === "PENDING" &&
    allVotesSubmitted &&
    !hasAnyParticipantThinking
  const results = data.results
  const isShowingResults =
    (data.currentVotingSessionStatus === "REVEALED" ||
      data.currentVotingSessionStatus === "DONE") &&
    Boolean(results)

  useEffect(() => {
    if (
      data.currentVotingSessionStatus !== "REVEALED" ||
      !results ||
      !data.currentVotingSessionId
    ) {
      setSelectedFinalScoreForClose(null)
      return
    }

    setSelectedFinalScoreForClose(results.selectedFinalScore ?? results.finalScore ?? null)
  }, [data.currentVotingSessionId, data.currentVotingSessionStatus, results])

  async function handleSubmitVote() {
    if (!isVotingOpen || !selectedVote || !data.currentVotingSessionId) {
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
    if (!open && data.canManageSessions && !data.currentVotingSessionId) {
      setHasDismissedAutoModal(true)
    }
  }

  function handleSelectVote(voteId: string) {
    setSelectedVote(voteId)

    if (
      !data.currentVotingSessionId ||
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
    if (!data.currentVotingSessionId || !canRevealNow) {
      return
    }

    revealVotingSession.reset()
    revealVotingSession.mutate({
      sessionId: data.currentVotingSessionId,
    })
  }

  function handleReVote() {
    if (!data.currentVotingSessionId || data.currentVotingSessionStatus !== "REVEALED") {
      return
    }
    reopenVotingSession.reset()
    reopenVotingSession.mutate({
      sessionId: data.currentVotingSessionId,
    })
  }

  function handleFinalizeScore() {
    if (!data.currentVotingSessionId || data.currentVotingSessionStatus !== "REVEALED") {
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

  return (
    <div className="min-h-svh bg-background text-foreground selection:bg-secondary selection:text-secondary-foreground">
      <TopNavBar ritualName={data.ritual.title} />

      <NewVotingSessionModal
        open={isCreateModalOpen}
        ritualId={sessionId as Id<"rituals">}
        onOpenChange={handleCreateModalOpenChange}
        onSessionCreated={() => {
          setHasDismissedAutoModal(false)
        }}
      />
      <EditRitualMemberDataDialog
        open={isEditMemberNameOpen}
        ritualId={sessionId as Id<"rituals">}
        initialMemberName={initialMemberNameForEdit}
        onOpenChange={setIsEditMemberNameOpen}
      />

      <main className="max-w-7xl mx-auto px-6 py-4 lg:py-8">
        {isShowingResults && results ? (
          <div className="space-y-6 mt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">Resultado da Rodada</h1>
                <p className="text-muted-foreground">
                  {data.currentSessionName ?? "Sessão sem título"}
                </p>
                {data.currentSessionExternalUrl && (
                  <a
                    href={data.currentSessionExternalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/15"
                  >
                    <span className="material-symbols-outlined text-base leading-none" aria-hidden="true">
                      open_in_new
                    </span>
                    Abrir item externo
                  </a>
                )}
              </div>
              {data.canManageSessions && data.currentVotingSessionStatus === "REVEALED" ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleReVote}
                    disabled={reopenVotingSession.isPending || closeVotingSession.isPending}
                  >
                    {reopenVotingSession.isPending ? "Reabrindo..." : "Votar novamente"}
                  </Button>
                  <Button
                    onClick={handleFinalizeScore}
                    disabled={
                      closeVotingSession.isPending ||
                      reopenVotingSession.isPending ||
                      !selectedFinalScoreForClose
                    }
                  >
                    {closeVotingSession.isPending
                      ? "Finalizando..."
                      : selectedFinalScoreForClose
                        ? "Finalizar pontuação"
                        : "Defina a pontuação final"}
                  </Button>
                </div>
              ) : null}
            </div>

            {(revealVotingSession.error || reopenVotingSession.error || closeVotingSession.error) && (
              <p className="text-sm text-destructive">
                {revealVotingSession.error?.message ||
                  reopenVotingSession.error?.message ||
                  closeVotingSession.error?.message}
              </p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <section className="lg:col-span-7 space-y-6">
                <Card className="bg-card/70 border-border/10">
                  <CardContent className="pt-8">
                    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
                      <div className="text-center">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                          Concordância
                        </div>
                        <div className="mt-2 text-4xl font-extrabold text-primary">
                          {results.agreementPercent}%
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          Pontuação final
                        </span>
                        <div className="mt-2 text-7xl font-black text-primary leading-none">
                          {selectedFinalScoreForClose ?? results.selectedFinalScore ?? "N/A"}
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          Resultado da votação
                        </span>
                        <div className="mt-2 text-5xl font-black text-primary leading-none">
                          {results.hasTie
                            ? results.topScores.join(" / ")
                            : (results.finalScore ?? "-")}
                        </div>
                        {results.hasTie ? (
                          <p className="mt-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            Empate
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {data.canManageSessions && data.currentVotingSessionStatus === "REVEALED" ? (
                  <Card className="bg-card/70 border-border/10">
                    <CardHeader>
                      <CardTitle>Pontuação final</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap justify-center gap-2">
                        {data.voteOptions.map((option) => {
                          const isSelected = selectedFinalScoreForClose === option.id
                          return (
                            <Button
                              key={option.id}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              onClick={() => setSelectedFinalScoreForClose(option.id)}
                              className={isSelected ? "bg-primary text-primary-foreground" : ""}
                            >
                              {option.id}
                            </Button>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                <Card className="bg-card/70 border-border/10">
                  <CardHeader>
                    <CardTitle>Distribuição dos Votos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-center gap-4 md:gap-8 min-h-56">
                      {results.distribution.map((item) => {
                        const maxCount = Math.max(
                          1,
                          ...results.distribution.map((distributionItem) => distributionItem.count),
                        )
                        const barHeight = Math.max(48, Math.round((item.count / maxCount) * 180))
                        const isWinner = results.topScores.includes(item.score)
                        const votePercent =
                          results.totalVotes > 0
                            ? Math.round((item.count / results.totalVotes) * 100)
                            : 0

                        return (
                          <div key={item.score} className="flex flex-col items-center min-w-16">
                            <span className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                              {item.count} voto{item.count === 1 ? "" : "s"} ({votePercent}%)
                            </span>
                            <div
                              className={`w-12 rounded-t-md ${isWinner ? "bg-primary shadow-[0_0_24px_rgba(132,85,239,0.45)]" : "bg-muted"} `}
                              style={{ height: `${barHeight}px` }}
                            />
                            <span className={`mt-3 text-3xl font-black ${isWinner ? "text-primary" : "text-foreground/80"}`}>
                              {item.score}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="lg:col-span-5">
                <Card className="bg-card/70 border-border/10">
                  <CardHeader>
                    <CardTitle>Detalhamento dos Votos</CardTitle>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                      {results.totalVotes} votos enviados
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between px-2 pb-1 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      <span>Participante</span>
                      <span>Voto</span>
                    </div>
                    {results.voterBreakdown.map((voter) => (
                      <div
                        key={voter.id}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          voter.isOutlier
                            ? "border-secondary/35 bg-secondary/10"
                            : "border-border/20 bg-card/60"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="truncate font-bold">{voter.name}</div>
                          <div className={`text-xs ${voter.isOutlier ? "text-rose-300" : "text-muted-foreground"}`}>
                            {voter.role}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {voter.isOutlier ? (
                            <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase bg-rose-500/15 text-rose-300">
                              Divergente
                            </span>
                          ) : null}
                          <span className={`text-xl font-black ${voter.isOutlier ? "text-rose-300" : "text-primary"}`}>
                            {voter.score ?? "-"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-8">
            <section className="lg:col-span-7 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-[240px] h-[240px] bg-primary/15 blur-2xl pointer-events-none" />

              <Card className="bg-card/70 border-border/10 mb-6">
                <CardHeader>
                  <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
                    {data.currentSessionName ?? "Aguardando o líder criar uma nova sessão..."}
                  </CardTitle>
                  {data.currentSessionExternalUrl && (
                    <a
                      href={data.currentSessionExternalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-fit items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/15"
                    >
                      <span className="material-symbols-outlined text-base leading-none" aria-hidden="true">
                        open_in_new
                      </span>
                      Abrir item externo
                    </a>
                  )}
                </CardHeader>
              </Card>

              <Card className="border-l-4 border-l-secondary/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-extrabold tracking-tight">
                    Coloque seu Voto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <VoteGrid
                    voteOptions={data.voteOptions}
                    selectedVote={selectedVote}
                    onSelectVote={handleSelectVote}
                    isVotingOpen={isVotingOpen}
                  />

                  {submitVote.error && (
                    <p className="text-sm text-destructive">{submitVote.error.message}</p>
                  )}
                  {revealVotingSession.error && (
                    <p className="text-sm text-destructive">{revealVotingSession.error.message}</p>
                  )}
                  {setVoteThinkingStatus.error && (
                    <p className="text-sm text-destructive">{setVoteThinkingStatus.error.message}</p>
                  )}
                  <Button
                    size="lg"
                    onClick={handleSubmitVote}
                    disabled={
                      !data.currentVotingSessionId ||
                      data.currentVotingSessionStatus !== "PENDING" ||
                      !selectedVote ||
                      submitVote.isPending
                    }
                    className="w-full mt-6 h-auto py-4 text-lg"
                  >
                    {submitVote.isPending
                      ? "Enviando..."
                      : hasCurrentUserVoted
                        ? "Mudar de ideia"
                        : selectedVote
                          ? "Pronto"
                          : "Selecione um voto"}
                  </Button>
                </CardContent>
              </Card>
            </section>

            <div className="lg:col-span-5 space-y-6">
              <ParticipantsPanel
                participants={data.participants}
                onEditSelfName={(currentName) => {
                  setInitialMemberNameForEdit(currentName)
                  setIsEditMemberNameOpen(true)
                }}
                headerAction={
                  data.canManageSessions && !data.currentVotingSessionId ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setHasDismissedAutoModal(false)
                        setIsCreateModalOpen(true)
                      }}
                    >
                      Criar nova sessão
                    </Button>
                  ) : canRevealNow ? (
                    <Button onClick={handleRevealVotingSession} disabled={revealVotingSession.isPending}>
                      {revealVotingSession.isPending ? "Revelando..." : "Revelar"}
                    </Button>
                  ) : data.voteProgress ? (
                    <div className="rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                      {!data.canManageSessions && allVotesSubmitted
                        ? "Aguardando revelação"
                        : `${data.voteProgress.submitted}/${data.voteProgress.totalVoters}`}
                    </div>
                  ) : null
                }
              />
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[204px] bg-secondary/10 blur-[150px] pointer-events-none" />
    </div>
  )
}
