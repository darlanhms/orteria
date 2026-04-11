import { VoteOptionCard, type SessionVoteOption } from "./VoteOptionCard"

export interface VoteGridProps {
  readonly voteOptions: ReadonlyArray<SessionVoteOption>
  readonly selectedVote: string | null
  readonly onSelectVote: (voteId: string) => void
  readonly isVotingOpen: boolean
}

export function VoteGrid({
  voteOptions,
  selectedVote,
  onSelectVote,
  isVotingOpen,
}: VoteGridProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {voteOptions.map((opt) => (
        <VoteOptionCard
          key={opt.id}
          option={opt}
          isSelected={selectedVote === opt.id}
          isDisabled={!isVotingOpen}
          onSelect={() => onSelectVote(opt.id)}
        />
      ))}
    </div>
  )
}
