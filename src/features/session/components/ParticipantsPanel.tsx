import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type SessionParticipantStatus = "PRONTO" | "PENSANDO..." | "VOTADO"

export type SessionParticipant = {
  readonly id: string
  readonly name: string
  readonly role: string
  readonly status: SessionParticipantStatus
}

export interface ParticipantsPanelProps {
  readonly participants: ReadonlyArray<SessionParticipant>
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
  participants,
}: ParticipantsPanelProps) {
  return (
    <Card className="bg-card/60 border-border/10">
      <CardHeader className="flex-row items-center justify-between gap-4 pb-4">
        <CardTitle className="text-primary font-extrabold text-lg">Participantes</CardTitle>
        <div
          className="w-10 h-6 rounded-full bg-secondary/20 border border-border/10 flex items-center p-1"
          aria-hidden="true"
        >
          <div className={cn("w-4 h-4 rounded-full bg-secondary/80")} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-card/70 border border-border/10"
          >
            <AvatarInitials name={p.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-foreground truncate">{p.name}</div>
              </div>
              <div className="text-xs text-muted-foreground">{p.role}</div>
            </div>
            <div
              className={cn(
                "shrink-0 rounded-md px-2 py-1 text-[11px] font-extrabold tracking-widest border",
                p.status === "PRONTO"
                  ? "bg-primary/15 text-primary border-primary/25"
                  : "bg-muted/60 text-foreground/70 border-border/10",
              )}
            >
              {p.status}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
