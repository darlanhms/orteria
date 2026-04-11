import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useConvexMutation } from "@convex-dev/react-query"
import { useNavigate } from "@tanstack/react-router"
import { api } from "~convex/_generated/api"
import { InitializeRitualSection, type InitializeRitualFormValues } from "./components/InitializeRitualSection"
import { TopNavBar } from "./components/TopNavBar"

export function TaskScorerLobbyPage() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const createRitual = useMutation({
    mutationFn: useConvexMutation(api.ritualVoting.createRitual),
  })

  async function handleManifestSession(values: InitializeRitualFormValues) {
    setSubmitError(null)
    try {
      const { ritualId } = await createRitual.mutateAsync({
        title: values.sessionIdentity,
        deckType: values.deckType,
        memberName: values.memberName,
      })
      await navigate({ to: "/session/$sessionId", params: { sessionId: ritualId } })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao iniciar ritual."
      setSubmitError(message)
    }
  }

  return (
    <div className="min-h-svh bg-background text-foreground selection:bg-secondary selection:text-secondary-foreground">
      <TopNavBar
        ritualName={null}
      />

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="flex flex-col items-center justify-center">
          <InitializeRitualSection
            isManifesting={createRitual.isPending}
            submitError={submitError}
            onManifestSession={handleManifestSession}
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[204px] bg-secondary/10 blur-[150px] pointer-events-none" />
    </div>
  )
}
