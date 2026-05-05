import { useConvexMutation } from "@convex-dev/react-query"
import { useMutation } from "@tanstack/react-query"
import type { Id } from "~convex/_generated/dataModel"
import { api } from "~convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { MemberManagementAction } from "./ParticipantsPanel"

export interface RitualMemberManagementTarget {
  readonly id: string
  readonly name: string
  readonly role: string
}

export interface ManageRitualMemberDialogProps {
  readonly open: boolean
  readonly ritualId: Id<"rituals">
  readonly targetMember: RitualMemberManagementTarget | null
  readonly action: MemberManagementAction | null
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirmed: () => void
}

type ActionConfig = {
  readonly title: string
  readonly confirmButtonLabel: string
  readonly description: (memberName: string) => string
  readonly isDestructive?: boolean
}

const ACTION_CONFIG: Record<MemberManagementAction, ActionConfig> = {
  KICK: {
    title: "Confirmar expulsão",
    confirmButtonLabel: "Confirmar expulsão",
    description: (memberName) => `Tem certeza que deseja expulsar ${memberName} do ritual?`,
    isDestructive: true,
  },
  SET_ADMIN: {
    title: "Confirmar promoção para líder",
    confirmButtonLabel: "Confirmar promoção",
    description: (memberName) =>
      `Tem certeza que deseja tornar ${memberName} um líder deste ritual?`,
  },
  SET_MEMBER: {
    title: "Confirmar remoção de líder",
    confirmButtonLabel: "Confirmar remoção",
    description: (memberName) =>
      `Tem certeza que deseja remover ${memberName} da liderança deste ritual?`,
  },
  SET_READONLY: {
    title: "Confirmar modo leitura",
    confirmButtonLabel: "Confirmar modo leitura",
    description: (memberName) =>
      `Tem certeza que deseja colocar ${memberName} em modo leitura?`,
  },
  SET_CAN_VOTE: {
    title: "Confirmar permissão de voto",
    confirmButtonLabel: "Confirmar permissão de voto",
    description: (memberName) =>
      `Tem certeza que deseja permitir que ${memberName} vote novamente?`,
  },
}

export function ManageRitualMemberDialog({
  open,
  ritualId,
  targetMember,
  action,
  onOpenChange,
  onConfirmed,
}: ManageRitualMemberDialogProps) {
  const manageRitualMember = useMutation({
    mutationFn: useConvexMutation(api.ritualVoting.manageRitualMember),
    onSuccess: () => {
      onConfirmed()
    },
  })

  const actionConfig = action ? ACTION_CONFIG[action] : null
  const dialogTitle = actionConfig?.title ?? "Confirmar ação"
  const dialogDescription =
    targetMember && actionConfig
      ? actionConfig.description(targetMember.name)
      : "Selecione um membro para gerenciar."
  const confirmButtonLabel = actionConfig?.confirmButtonLabel ?? "Confirmar"
  const isDestructive = actionConfig?.isDestructive ?? false

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
