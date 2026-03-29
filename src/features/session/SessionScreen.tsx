import { ParticipantsPanel } from "./components/ParticipantsPanel"
import { VoteOptionCard } from "./components/VoteOptionCard"
import type { SessionVoteOption } from "./components/VoteOptionCard"
import type { SessionParticipant } from "./components/ParticipantsPanel"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNavBar } from "@/features/lobby/components/TopNavBar"

export interface SessionScreenProps {
  readonly sessionId: string
}

const stubVoteOptions: ReadonlyArray<SessionVoteOption> = [
  { id: "RN", label: "RN", sizingLabel: "EXTRA PEQUENO" },
  { id: "PP", label: "PP", sizingLabel: "PEQUENO" },
  { id: "P", label: "P", sizingLabel: "MÉDIO-PEQUENO" },
  { id: "M", label: "M", sizingLabel: "MÉDIO" },
  { id: "G", label: "G", sizingLabel: "GRANDE" },
  { id: "GG", label: "GG", sizingLabel: "EXTRA GRANDE" },
  { id: "XGG", label: "XGG", sizingLabel: "EPICO" },
]

const stubParticipants: ReadonlyArray<SessionParticipant> = [
  { id: "alex-chen", name: "Alex Chen", role: "LEAD ARCHITECT", status: "PRONTO" },
  { id: "sarah-j", name: "Sarah Jenkins", role: "DEVOPS", status: "PENSANDO..." },
  { id: "marcus-v", name: "Marcus Voe", role: "BACKEND", status: "PRONTO" },
  { id: "john-doe", name: "John Doe (Você)", role: "FULLSTACK", status: "VOTADO" },
]

const stubSession = {
  title: "Refatorar Payment Gateway Microservice",
  description:
    "Refine a lógica transacional com controle total de sentenças e melhora do tratamento de erros.",
}

function VoteGrid({ voteOptions }: { readonly voteOptions: ReadonlyArray<SessionVoteOption> }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {voteOptions.map((opt) => (
        <VoteOptionCard
          key={opt.id}
          option={opt}
          isSelected={false}
          isDisabled={false}
          onSelect={() => {}}
        />
      ))}
    </div>
  )
}

export function SessionScreen({ sessionId: _sessionId }: SessionScreenProps) {
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
                  {stubSession.title}
                </CardTitle>
                <CardDescription className="max-w-md">
                  {stubSession.description}
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
                <VoteGrid voteOptions={stubVoteOptions} />

                <Button
                  size="lg"
                  onClick={() => {}}
                  className="w-full mt-6 h-auto py-4 text-lg"
                >
                  Pronto
                </Button>
              </CardContent>
            </Card>
          </section>

          <div className="lg:col-span-5 space-y-6">
            <ParticipantsPanel participants={stubParticipants} />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[204px] bg-secondary/10 blur-[150px] pointer-events-none" />
    </div>
  )
}
