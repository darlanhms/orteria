import { useConvexMutation } from "@convex-dev/react-query"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Id } from "~convex/_generated/dataModel"
import { api } from "~convex/_generated/api"
import type { MemberManagementAction } from "./ParticipantsPanel"

export interface ManageRitualMemberDialogTarget {
  readonly id: string
  readonly name: string
  readonly role: string
}

export interface ConfirmKickMemberDialogProps {
  readonly open: boolean
  readonly ritualId: Id<"rituals">
  readonly targetMember: ManageRitualMemberDialogTarget | null
  readonly action: MemberManagementAction | null
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirmed: () => void
}

export function ConfirmKickMemberDialog({
  open,
  ritualId,
  targetMember,
  action,
  onOpenChange,
  onConfirmed,
}: ConfirmKickMemberDialogProps) {
  const manageRitualMember = useMutation({
    mutationFn: useConvexMutation(api.ritualVoting.manageRitualMember),
    onSuccess: () => {
      onConfirmed()
    },
  })

  const dialogTitle =
    action === "KICK"
      ? "Confirmar expulsão"
      : action === "SET_READONLY"
        ? "Confirmar modo leitura"
        : action === "SET_CAN_VOTE"
          ? "Confirmar permissão de voto"
          : "Confirmar ação"
  const dialogDescription = targetMember
    ? action === "KICK"
      ? `Tem certeza que deseja expulsar ${targetMember.name} do ritual?`
      : action === "SET_READONLY"
        ? `Tem certeza que deseja colocar ${targetMember.name} em modo leitura?`
        : action === "SET_CAN_VOTE"
          ? `Tem certeza que deseja permitir que ${targetMember.name} vote novamente?`
          : "Selecione uma ação válida."
    : "Selecione um membro para gerenciar."
  const confirmButtonLabel =
    action === "KICK"
      ? "Confirmar expulsão"
      : action === "SET_READONLY"
        ? "Confirmar modo leitura"
        : action === "SET_CAN_VOTE"
          ? "Confirmar permissão de voto"
          : "Confirmar"
  const isDestructive = action === "KICK"

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          manageRitualMember.reset()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {manageRitualMember.error && (
          <p className="text-sm text-destructive">{manageRitualMember.error.message}</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            disabled={!targetMember || !action || manageRitualMember.isPending}
            onClick={() => {
              if (!targetMember || !action) return
              manageRitualMember.reset()
              manageRitualMember.mutate({
                ritualId,
                memberId: targetMember.id as Id<"ritualMembers">,
                action,
              })
            }}
          >
            {manageRitualMember.isPending ? "Processando..." : confirmButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
