import { InitializeRitualSection } from "./components/InitializeRitualSection"
import { JoinSessionSection } from "./components/JoinSessionSection"
import { TopNavBar } from "./components/TopNavBar"

export function TaskScorerLobbyPage() {
  return (
    <div className="min-h-svh bg-background text-foreground selection:bg-secondary selection:text-secondary-foreground">
      <TopNavBar
        activeTab="Lobby"
        onTabChange={() => {}}
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
            sessionIdentity=""
            selectedDeck="Fibonacci"
            canManifestSession={false}
            isManifesting={false}
            onSessionIdentityChange={() => {}}
            onDeckSelect={() => {}}
            onManifestSession={() => {}}
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[204px] bg-secondary/10 blur-[150px] pointer-events-none" />
    </div>
  )
}
