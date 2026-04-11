import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TopNavBar } from "@/features/lobby/components/TopNavBar"

export interface JoinRitualGateProps {
  readonly ritualTitle: string
  readonly joinMemberName: string
  readonly onJoinMemberNameChange: (value: string) => void
  readonly isJoining: boolean
  readonly joinErrorMessage: string | null
  readonly onJoin: () => void
  readonly onCancel: () => void
}

export function JoinRitualGate({
  ritualTitle,
  joinMemberName,
  onJoinMemberNameChange,
  isJoining,
  joinErrorMessage,
  onJoin,
  onCancel,
}: JoinRitualGateProps) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <TopNavBar ritualName={ritualTitle} />
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Entrar neste ritual?</DialogTitle>
            <DialogDescription>
              Você ainda não participa do ritual{" "}
              <span className="font-semibold text-foreground">
                "{ritualTitle}"
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
              onChange={(event) => onJoinMemberNameChange(event.target.value)}
              placeholder="Ex: Darlan"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          {joinErrorMessage && (
            <p className="text-sm text-destructive">{joinErrorMessage}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={onCancel} disabled={isJoining}>
              Agora não
            </Button>
            <Button
              onClick={onJoin}
              disabled={isJoining || joinMemberName.trim().length === 0}
            >
              {isJoining ? "Entrando..." : "Entrar no ritual"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
