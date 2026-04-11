export interface SessionScreenStateProps {
  readonly message: string
}

export function SessionScreenState({ message }: SessionScreenStateProps) {
  return (
    <div className="min-h-svh bg-background text-foreground flex items-center justify-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
