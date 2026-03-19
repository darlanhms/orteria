import { InitializeRitualSection } from "./components/InitializeRitualSection"
import { JoinSessionSection } from "./components/JoinSessionSection"
import { TopNavBar } from "./components/TopNavBar"
import { useTaskScorerLobbyController } from "./useTaskScorerLobbyController"
import type { LobbyTab } from "./useTaskScorerLobbyController"

export function TaskScorerLobbyPage() {
  const {
    accessKey,
    inputRefs,
    activeTab,
    sessionIdentity,
    selectedDeck,
    isEnterAtriumEnabled,
    isJoiningAtrium,
    canManifestSession,
    isManifesting,
    setActiveTab,
    setSessionIdentity,
    setSelectedDeck,
    handleAccessKeyChange,
    handleAccessKeyKeyDown,
    handleJoinAtrium,
    handleManifestSession,
  } = useTaskScorerLobbyController()

  return (
    <div className="min-h-svh bg-background text-foreground selection:bg-secondary selection:text-secondary-foreground">
      <TopNavBar
        activeTab={activeTab}
        onTabChange={(tab: LobbyTab) => setActiveTab(tab)}
      />

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-16">
          <JoinSessionSection
            accessKey={accessKey}
            inputRefs={inputRefs}
            isEnterAtriumEnabled={isEnterAtriumEnabled}
            isJoiningAtrium={isJoiningAtrium}
            onAccessKeyChange={handleAccessKeyChange}
            onAccessKeyKeyDown={handleAccessKeyKeyDown}
            onJoinAtrium={handleJoinAtrium}
          />

          <InitializeRitualSection
            sessionIdentity={sessionIdentity}
            selectedDeck={selectedDeck}
            canManifestSession={canManifestSession}
            isManifesting={isManifesting}
            onSessionIdentityChange={setSessionIdentity}
            onDeckSelect={setSelectedDeck}
            onManifestSession={handleManifestSession}
          />
        </div>

        {/* Recent rituals footer removed per request */}
      </main>

      {/* Ambient Glow Decoration */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[204px] bg-secondary/10 blur-[150px] pointer-events-none" />
    </div>
  )
}

