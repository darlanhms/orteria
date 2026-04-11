import { EditRitualMemberDataDialog } from "./components/EditRitualMemberDataDialog"
import {
  ConfirmKickMemberDialog,
} from "./components/ConfirmKickMemberDialog"
import { JoinRitualGate } from "./components/JoinRitualGate"
import { NewVotingSessionModal } from "./components/NewVotingSessionModal"
import { SessionResultsView } from "./components/SessionResultsView"
import { SessionScreenState } from "./components/SessionScreenState"
import { SessionVotingView } from "./components/SessionVotingView"
import { useSessionScreen } from "./hooks/useSessionScreen"
import type { Id } from "~convex/_generated/dataModel"

import { TopNavBar } from "@/features/lobby/components/TopNavBar"

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

export function SessionScreen({
  sessionId,
}: SessionScreenProps) {
  const screen = useSessionScreen({ sessionId })
  const { ids, access, session, derived, ui, mutations, actions, convexAuth } = screen

  if (convexAuth.isLoading) {
    return <SessionScreenState message="Carregando sessão..." />
  }

  if (!convexAuth.isAuthenticated) {
    return (
      <SessionScreenState message="Não foi possível sincronizar a autenticação com o servidor. Atualize a página." />
    )
  }

  if (!ids.isRitualIdParamValid) {
    return <SessionScreenState message="Sessão não encontrada." />
  }

  if (access.isAccessPending) {
    return <SessionScreenState message="Carregando sessão..." />
  }

  if (access.isAccessError) {
    return <SessionScreenState message={access.accessError?.message ?? "Falha ao carregar acesso da sessão."} />
  }

  if (!access.ritualAccessData?.ritualExists) {
    return <SessionScreenState message="Sessão não encontrada." />
  }

  if (!access.ritualAccessData.isMember) {
    return (
      <JoinRitualGate
        ritualTitle={access.ritualAccessData.ritualTitle ?? "Ritual"}
        joinMemberName={ui.joinMemberName}
        onJoinMemberNameChange={ui.setJoinMemberName}
        isJoining={mutations.joinRitual.isPending}
        joinErrorMessage={mutations.joinRitual.error?.message ?? null}
        onCancel={() => actions.navigate({ to: "/" })}
        onJoin={actions.handleJoinRitual}
      />
    )
  }

  if (session.isPending) {
    return <SessionScreenState message="Carregando sessão..." />
  }

  if (session.isError) {
    return <SessionScreenState message={session.error?.message ?? "Falha ao carregar a sessão."} />
  }

  if (session.sessionData === null) {
    return <SessionScreenState message="Sessão não encontrada." />
  }

  if (!session.data) {
    return <SessionScreenState message="Falha ao carregar a sessão." />
  }

  const data = session.data

  return (
    <div className="min-h-svh bg-background text-foreground selection:bg-secondary selection:text-secondary-foreground">
      <TopNavBar ritualName={data.ritual.title} />

      <NewVotingSessionModal
        open={ui.isCreateModalOpen}
        ritualId={ids.ritualId}
        onOpenChange={actions.handleCreateModalOpenChange}
        onSessionCreated={() => {
          ui.setHasDismissedAutoModal(false)
        }}
      />
      <EditRitualMemberDataDialog
        open={ui.isEditMemberNameOpen}
        ritualId={ids.ritualId}
        initialMemberName={ui.initialMemberNameForEdit}
        memberId={derived.currentUserParticipant?.id as Id<"ritualMembers"> | undefined}
        canManageReadOnly={data.canManageSessions}
        canVote={derived.currentUserParticipant?.canVote ?? true}
        onOpenChange={ui.setIsEditMemberNameOpen}
      />
      <ConfirmKickMemberDialog
        open={ui.isConfirmKickOpen}
        ritualId={ids.ritualId}
        targetMember={ui.memberToManage}
        action={ui.memberActionToConfirm}
        onOpenChange={(open) => {
          ui.setIsConfirmKickOpen(open)
          if (!open) {
            actions.handleResetMemberManagement()
          }
        }}
        onConfirmed={() => {
          ui.setIsConfirmKickOpen(false)
          actions.handleResetMemberManagement()
        }}
      />

      <main className="max-w-7xl mx-auto px-6 py-4 lg:py-8">
        {session.isShowingResults && session.results ? (
          <SessionResultsView screen={screen} />
        ) : (
          <SessionVotingView screen={screen} />
        )}
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[204px] bg-secondary/10 blur-[150px] pointer-events-none" />
    </div>
  )
}
