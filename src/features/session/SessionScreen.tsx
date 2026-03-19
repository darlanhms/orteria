import { ParticipantsPanel } from "./components/ParticipantsPanel"
import { VoteOptionCard } from "./components/VoteOptionCard"
import { useSessionController } from "./useSessionController"
import type { MockVoteOptionId, SessionVoteOption } from "./useSessionController"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNavBar } from "@/features/lobby/components/TopNavBar"

export interface SessionScreenProps {
  readonly sessionId: string
}

function VoteGrid({
  voteOptions,
  selectedVoteId,
  isRevealed,
  onSelectVote,
}: {
  readonly voteOptions: ReadonlyArray<SessionVoteOption>
  readonly selectedVoteId: MockVoteOptionId | null
  readonly isRevealed: boolean
  readonly onSelectVote: (id: MockVoteOptionId) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {voteOptions.map((opt) => (
        <VoteOptionCard
          key={opt.id}
          option={opt}
          isSelected={selectedVoteId === opt.id}
          isDisabled={isRevealed}
          onSelect={() => onSelectVote(opt.id)}
        />
      ))}
    </div>
  )
}

export function SessionScreen({ sessionId }: SessionScreenProps) {
  const {
    session,
    isRevealed,
    selectedVoteId,
    voteOptions,
    participants,
    handleSelectVote,
    handleRevealVotes,
    handleResetRound,
  } = useSessionController(sessionId)

  return (
    <div className="min-h-svh bg-background text-foreground selection:bg-secondary selection:text-secondary-foreground">
      <TopNavBar activeTab="Vote" onTabChange={() => {}} />

      <main className="max-w-7xl mx-auto px-6 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-8">
          <section className="lg:col-span-7 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-[240px] h-[240px] bg-primary/15 blur-2xl pointer-events-none" />

            <Card className="bg-card/70 border-border/10 mb-6">
              <CardHeader>
                <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
                  {session.title}
                </CardTitle>
                <CardDescription className="max-w-md">
                  {session.description}
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
                  voteOptions={voteOptions}
                  selectedVoteId={selectedVoteId}
                  isRevealed={isRevealed}
                  onSelectVote={handleSelectVote}
                />

                <Button
                  size="lg"
                  onClick={isRevealed ? handleResetRound : handleRevealVotes}
                  className={[
                    "w-full mt-6 h-auto py-4 text-lg",
                    isRevealed
                      ? "bg-primary/70 text-primary-foreground hover:bg-primary/60"
                      : "",
                  ].join(" ")}
                >
                  {isRevealed ? "Repensar" : "Pronto"}
                </Button>
              </CardContent>
            </Card>
          </section>

          <div className="lg:col-span-5 space-y-6">
            <ParticipantsPanel participants={participants} />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[204px] bg-secondary/10 blur-[150px] pointer-events-none" />
    </div>
  )
}

