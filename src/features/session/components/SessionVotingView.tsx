import { type SessionScreenModel } from "../hooks/useSessionScreen"
import { ParticipantsPanel } from "./ParticipantsPanel"
import { VoteGrid } from "./VoteGrid"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface SessionVotingViewProps {
  readonly screen: SessionScreenModel
}

export function SessionVotingView({ screen }: SessionVotingViewProps) {
  const { session, derived, ui, mutations, actions } = screen
  const data = session.data

  if (!data) {
    return null
  }

  const headerAction =
    data.canManageSessions && !data.currentVotingSessionId ? (
      <Button variant="outline" onClick={actions.handleOpenCreateSessionModal}>
        Criar nova sessão
      </Button>
    ) : derived.canRevealNow ? (
      <Button onClick={actions.handleRevealVotingSession} disabled={mutations.revealVotingSession.isPending}>
        {mutations.revealVotingSession.isPending ? "Revelando..." : "Revelar"}
      </Button>
    ) : data.voteProgress ? (
      <div className="rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
        {!data.canManageSessions && derived.allVotesSubmitted
          ? "Aguardando revelação"
          : `${data.voteProgress.submitted}/${data.voteProgress.totalVoters}`}
      </div>
    ) : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-8">
      <section className="lg:col-span-7">
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
              {derived.currentUserCanVote ? "Coloque seu Voto" : "Modo leitura"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <VoteGrid
              voteOptions={data.voteOptions}
              selectedVote={ui.selectedVote}
              onSelectVote={actions.handleSelectVote}
              isVotingOpen={derived.isVotingOpen}
            />

            {mutations.submitVote.error?.message && (
              <p className="text-sm text-destructive">{mutations.submitVote.error.message}</p>
            )}
            {mutations.revealVotingSession.error?.message && (
              <p className="text-sm text-destructive">{mutations.revealVotingSession.error.message}</p>
            )}
            {mutations.setVoteThinkingStatus.error?.message && (
              <p className="text-sm text-destructive">{mutations.setVoteThinkingStatus.error.message}</p>
            )}
            {!derived.currentUserCanVote && (
              <p className="text-sm text-muted-foreground">
                Você está em modo leitura e acompanha a votação como espectador.
              </p>
            )}
            <Button
              size="lg"
              onClick={actions.handleSubmitVote}
              disabled={
                !derived.currentUserCanVote ||
                !derived.canSubmitVote ||
                mutations.submitVote.isPending
              }
              className="w-full mt-6 h-auto py-4 text-lg"
            >
              {!derived.currentUserCanVote
                ? "Você está em modo leitura"
                : mutations.submitVote.isPending
                  ? "Enviando..."
                  : derived.hasCurrentUserVoted
                    ? "Mudar de ideia"
                    : ui.selectedVote
                      ? "Pronto"
                      : "Selecione um voto"}
            </Button>
          </CardContent>
        </Card>
      </section>

      <div className="lg:col-span-5 space-y-6">
        <ParticipantsPanel
          participants={derived.voterParticipants}
          canManageMembers={data.canManageSessions}
          onEditSelfName={actions.handleEditSelfName}
          onManageMember={actions.handleManageMember}
          headerAction={headerAction}
        />
        {derived.spectatorParticipants.length > 0 ? (
          <ParticipantsPanel
            title="Espectadores"
            participants={derived.spectatorParticipants}
            canManageMembers={data.canManageSessions}
            onEditSelfName={actions.handleEditSelfName}
            onManageMember={actions.handleManageMember}
          />
        ) : null}
      </div>
    </div>
  )
}
