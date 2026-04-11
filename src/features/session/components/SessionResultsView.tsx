import { ParticipantsPanel } from "./ParticipantsPanel"
import type { SessionScreenModel } from "../hooks/useSessionScreen"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface SessionResultsViewProps {
  readonly screen: SessionScreenModel
}

export function SessionResultsView({ screen }: SessionResultsViewProps) {
  const { session, derived, ui, mutations, actions } = screen
  const data = session.data
  const results = session.results

  if (!data || !results) {
    return null
  }

  return (
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
              onClick={actions.handleReVote}
              disabled={mutations.reopenVotingSession.isPending || mutations.closeVotingSession.isPending}
            >
              {mutations.reopenVotingSession.isPending ? "Reabrindo..." : "Votar novamente"}
            </Button>
            <Button
              onClick={actions.handleFinalizeScore}
              disabled={
                mutations.closeVotingSession.isPending ||
                mutations.reopenVotingSession.isPending ||
                !ui.selectedFinalScoreForClose
              }
            >
              {mutations.closeVotingSession.isPending
                ? "Finalizando..."
                : ui.selectedFinalScoreForClose
                  ? "Finalizar pontuação"
                  : "Defina a pontuação final"}
            </Button>
          </div>
        ) : null}
      </div>

      {(mutations.revealVotingSession.error?.message ||
        mutations.reopenVotingSession.error?.message ||
        mutations.closeVotingSession.error?.message) && (
        <p className="text-sm text-destructive">
          {mutations.revealVotingSession.error?.message ||
            mutations.reopenVotingSession.error?.message ||
            mutations.closeVotingSession.error?.message}
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
                    {ui.selectedFinalScoreForClose ?? results.selectedFinalScore ?? "N/A"}
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
                    const isSelected = ui.selectedFinalScoreForClose === option.id
                    return (
                      <Button
                        key={option.id}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => ui.setSelectedFinalScoreForClose(option.id)}
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

        <section className="lg:col-span-5 space-y-6">
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
                  className={`flex items-center justify-between rounded-lg border p-3 ${voter.isOutlier
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
          {derived.spectatorParticipants.length > 0 ? (
            <ParticipantsPanel
              title="Espectadores"
              participants={derived.spectatorParticipants}
              canManageMembers={data.canManageSessions}
              onEditSelfName={actions.handleEditSelfName}
              onManageMember={actions.handleManageMember}
            />
          ) : null}
        </section>
      </div>
    </div>
  )
}
