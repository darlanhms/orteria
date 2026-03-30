import type { LobbyDeck } from "./InitializeRitualSection"

import { Button } from "@/components/ui/button"

export interface DeckOptionCardProps {
  readonly deckId: LobbyDeck
  readonly title: string
  readonly description: string
  readonly icon: string
  readonly isSelected: boolean
  readonly onSelect: (deck: LobbyDeck) => void
}

export function DeckOptionCard({
  deckId,
  title,
  description,
  icon,
  isSelected,
  onSelect,
}: DeckOptionCardProps) {
  return (
    <Button
      variant="ghost"
      aria-pressed={isSelected}
      data-selected={isSelected ? "true" : "false"}
      onClick={() => onSelect(deckId)}
      className={[
        "h-auto p-6 rounded-xl transition-all cursor-pointer text-left flex-col items-start",
        "bg-card border border-border/20",
        "hover:bg-muted/60 hover:scale-[1.02] active:scale-[0.99]",
        isSelected ? "border-primary ring-1 ring-primary/30" : "",
      ].join(" ")}
    >
      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4">
        <span className="material-symbols-outlined" aria-hidden="true">
          {icon}
        </span>
      </div>
      <h3 className="font-bold text-lg mb-1 text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Button>
  )
}

