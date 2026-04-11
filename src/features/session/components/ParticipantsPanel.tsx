import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type SessionParticipantStatus = "PRONTO" | "PENSANDO" | "VOTADO"
export type MemberManagementAction = "KICK" | "SET_READONLY" | "SET_CAN_VOTE"

export type SessionParticipant = {
  readonly id: string
  readonly name: string
  readonly isCurrentUser: boolean
  readonly role: string
  readonly canVote: boolean
  readonly status: SessionParticipantStatus
}

export interface ParticipantsPanelProps {
  readonly title?: string
  readonly participants: ReadonlyArray<SessionParticipant>
  readonly headerAction?: ReactNode
  readonly canManageMembers?: boolean
  readonly onEditSelfName?: (currentName: string) => void
  readonly onManageMember?: (
    participant: SessionParticipant,
    action: MemberManagementAction,
  ) => void
}

function AvatarInitials({ name }: { readonly name: string }) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .filter(Boolean)
    .join("")

  return (
    <div
      className="w-10 h-10 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-extrabold"
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

export function ParticipantsPanel({
  title = "Participantes",
  participants,
  headerAction,
  canManageMembers = false,
  onEditSelfName,
  onManageMember,
}: ParticipantsPanelProps) {
  return (
    <Card className="bg-card/60 border-border/10">
      <CardHeader className="flex-row items-center justify-between gap-4 pb-4">
        <CardTitle className="text-primary font-extrabold text-lg">{title}</CardTitle>
        {headerAction}
      </CardHeader>

      <CardContent className="space-y-3">
        {participants.map((p) => {
          const cardClasses = cn(
            "flex w-full items-center gap-3 p-3 rounded-lg bg-card/70 border border-border/10 text-left",
            (p.isCurrentUser || (canManageMembers && !p.isCurrentUser)) &&
              "cursor-pointer hover:border-primary/40 transition-colors",
          )
          const cardContent = (
            <>
              <AvatarInitials name={p.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-foreground truncate">{p.name}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {p.role}
                </div>
              </div>
              <div
                className={cn(
                  "shrink-0 rounded-md px-2 py-1 text-[11px] font-extrabold tracking-widest border",
                  !p.canVote
                    ? "bg-sky-500/10 text-sky-300 border-sky-400/20"
                    : p.status === "PRONTO"
                      ? "bg-primary/15 text-primary border-primary/25"
                      : "bg-muted/60 text-foreground/70 border-border/10",
                )}
              >
                {p.canVote ? p.status : "ESPECTADOR"}
              </div>
            </>
          )

          if (canManageMembers && !p.isCurrentUser) {
            return (
              <DropdownMenu key={p.id}>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={cardClasses} aria-label={`Gerenciar ${p.name}`}>
                    {cardContent}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {p.canVote ? (
                    <DropdownMenuItem onClick={() => onManageMember?.(p, "SET_READONLY")}>
                      Tornar somente leitura
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onManageMember?.(p, "SET_CAN_VOTE")}>
                      Permitir votar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onManageMember?.(p, "KICK")}
                  >
                    Expulsar membro
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          if (p.isCurrentUser) {
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onEditSelfName?.(p.name)}
                className={cardClasses}
              >
                {cardContent}
              </button>
            )
          }

          return (
            <div key={p.id} className={cardClasses}>
              {cardContent}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
