import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { ParticipantsPanel } from "./components/ParticipantsPanel"
import { VoteOptionCard } from "./components/VoteOptionCard"
import type { SessionVoteOption } from "./components/VoteOptionCard"
import type { Id } from "../../../convex/_generated/dataModel"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNavBar } from "@/features/lobby/components/TopNavBar"
import { api } from "../../../convex/_generated/api"

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

export function SessionScreen({ sessionId }: SessionScreenProps) {
  const [selectedVote, setSelectedVote] = useState<string | null>(null)
  const [isSubmittingVote, setIsSubmittingVote] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const submitVote = useMutation(api.ritualVoting.submitVote)
  const sessionData = useQuery(api.ritualVoting.getSessionScreenData, {
    ritualId: sessionId as Id<"rituals">,
  })

  if (sessionData === undefined) {
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

  const data = sessionData
  const isVotingOpen =
    data.currentVotingSessionStatus === "PENDING" &&
    Boolean(data.currentVotingSessionId) &&
    !isSubmittingVote

  async function handleSubmitVote() {
    if (!isVotingOpen || !selectedVote || !data.currentVotingSessionId) {
      return
    }

    setIsSubmittingVote(true)
    setSubmitError(null)
    try {
      await submitVote({
        sessionId: data.currentVotingSessionId,
        score: selectedVote,
      })
      setSelectedVote(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao enviar voto."
      setSubmitError(message)
    } finally {
      setIsSubmittingVote(false)
    }
  }

  return (
    <div className="min-h-svh bg-background text-foreground selection:bg-secondary selection:text-secondary-foreground">
      <TopNavBar ritualName={data.ritual.title} />

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
                      : "Sem sessão ativa no momento."}
                </CardDescription>
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

                {submitError && (
                  <p className="text-sm text-destructive">{submitError}</p>
                )}
                <Button
                  size="lg"
                  onClick={handleSubmitVote}
                  disabled={
                    !data.currentVotingSessionId ||
                    data.currentVotingSessionStatus !== "PENDING" ||
                    !selectedVote ||
                    isSubmittingVote
                  }
                  className="w-full mt-6 h-auto py-4 text-lg"
                >
                  {isSubmittingVote ? "Enviando..." : "Pronto"}
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
