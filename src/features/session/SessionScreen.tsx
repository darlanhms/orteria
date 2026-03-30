import { useEffect, useState } from "react"
import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ParticipantsPanel } from "./components/ParticipantsPanel"
import { NewVotingSessionModal } from "./components/NewVotingSessionModal"
import { VoteOptionCard } from "./components/VoteOptionCard"
import type { SessionVoteOption } from "./components/VoteOptionCard"
import type { Id } from "~convex/_generated/dataModel"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNavBar } from "@/features/lobby/components/TopNavBar"
import { api } from "~convex/_generated/api"

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
  const [selectedVote, setSelectedVote] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [hasDismissedAutoModal, setHasDismissedAutoModal] = useState(false)
  const submitVote = useMutation({
    mutationFn: useConvexMutation(api.ritualVoting.submitVote),
    onSuccess: () => {
      setSelectedVote(null)
    },
  })
  const { data: sessionData, isPending } = useQuery(
    convexQuery(api.ritualVoting.getSessionScreenData, {
      ritualId: sessionId as Id<"rituals">,
    }),
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

  if (isPending) {
    return (
      <div className="min-h-svh bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Carregando sessão...</p>
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

  const data = sessionData as NonNullable<typeof sessionData>

  const isVotingOpen =
    data.currentVotingSessionStatus === "PENDING" &&
    Boolean(data.currentVotingSessionId) &&
    !submitVote.isPending

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

      <main className="max-w-7xl mx-auto px-6 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-8">
          <section className="lg:col-span-7 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-[240px] h-[240px] bg-primary/15 blur-2xl pointer-events-none" />

            <Card className="bg-card/70 border-border/10 mb-6">
              <CardHeader>
                <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
                  {data.currentSessionName ?? "Aguardando o líder criar uma nova sessão..."}
                </CardTitle>
                <CardDescription className="max-w-md">
                  {data.currentSessionName && data.currentVotingSessionStatus === "PENDING"
                    ? `Aguardando votos (${data.voteProgress?.submitted ?? 0}/${data.voteProgress?.totalVoters ?? 0}).`
                    : data.currentVotingSessionStatus === "REVEALED"
                      ? "Votos revelados. O líder/admin pode reabrir a rodada em caso de discrepância."
                      : "Aguardando o líder criar uma nova sessão..."}
                </CardDescription>
                {data.canManageSessions && !data.currentVotingSessionId && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setHasDismissedAutoModal(false)
                        setIsCreateModalOpen(true)
                      }}
                    >
                      Criar nova sessão
                    </Button>
                  </div>
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
                  onSelectVote={setSelectedVote}
                  isVotingOpen={isVotingOpen}
                />

                {submitVote.error && (
                  <p className="text-sm text-destructive">{submitVote.error.message}</p>
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
                  {submitVote.isPending ? "Enviando..." : "Pronto"}
                </Button>
              </CardContent>
            </Card>
          </section>

          <div className="lg:col-span-5 space-y-6">
            <ParticipantsPanel participants={data.participants} />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[204px] bg-secondary/10 blur-[150px] pointer-events-none" />
    </div>
  )
}
