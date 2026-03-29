import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SessionVoteOption = {
  readonly id: string
  readonly label: string
  readonly sizingLabel: string
}

export interface VoteOptionCardProps {
  readonly option: SessionVoteOption
  readonly isSelected: boolean
  readonly isDisabled: boolean
  readonly onSelect: () => void
}

export function VoteOptionCard({
  option,
  isSelected,
  isDisabled,
  onSelect,
}: VoteOptionCardProps) {
  return (
    <Button
      variant="ghost"
      disabled={isDisabled}
      aria-pressed={isSelected}
      data-testid={`vote-option-${option.id}`}
      onClick={onSelect}
      className={cn(
        "h-auto aspect-square p-5 rounded-xl transition-all cursor-pointer text-left",
        "bg-card/70 border border-border/20",
        "hover:bg-muted/60 hover:scale-[1.02] active:scale-[0.99]",
        isSelected
          ? "border-primary ring-1 ring-primary/30 bg-primary/15"
          : "",
        isDisabled ? "opacity-70 cursor-not-allowed" : "",
      )}
    >
      <div className="h-full flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-extrabold tracking-tight",
            isSelected ? "text-primary" : "text-foreground/80",
            "text-2xl",
          )}
        >
          {option.label}
        </span>
        <span className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          {option.sizingLabel}
        </span>
      </div>
    </Button>
  )
}
