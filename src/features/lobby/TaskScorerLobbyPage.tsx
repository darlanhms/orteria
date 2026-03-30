import { useState } from "react"
import { useMutation } from "convex/react"
import { useNavigate } from "@tanstack/react-router"
import { api } from "../../../convex/_generated/api"
import { InitializeRitualSection, type InitializeRitualFormValues } from "./components/InitializeRitualSection"
import { JoinSessionSection } from "./components/JoinSessionSection"
import { TopNavBar } from "./components/TopNavBar"

export function TaskScorerLobbyPage() {
  const navigate = useNavigate()
  const createRitual = useMutation(api.ritualVoting.createRitual)
  const [isManifesting, setIsManifesting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleManifestSession(values: InitializeRitualFormValues) {
    setIsManifesting(true)
    setSubmitError(null)
    try {
      const { ritualId } = await createRitual({
        title: values.sessionIdentity,
        deckType: values.deckType,
      })
      await navigate({ to: "/session/$sessionId", params: { sessionId: ritualId } })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao iniciar ritual."
      setSubmitError(message)
    } finally {
      setIsManifesting(false)
    }
  }

  return (
    <div className="min-h-svh bg-background text-foreground selection:bg-secondary selection:text-secondary-foreground">
      <TopNavBar
        ritualName={null}
      />

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-16">
          <JoinSessionSection
            accessKey={["", "", "", "", "", ""]}
            isEnterAtriumEnabled={false}
            isJoiningAtrium={false}
            onAccessKeyChange={() => {}}
            onAccessKeyKeyDown={() => {}}
            onJoinAtrium={() => {}}
          />

          <InitializeRitualSection
            isManifesting={isManifesting}
            submitError={submitError}
            onManifestSession={handleManifestSession}
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[204px] bg-secondary/10 blur-[150px] pointer-events-none" />
    </div>
  )
}
