import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthDialog } from "@/components/AuthDialog"
import { authClient } from "@/lib/auth-client"
import logoSvg from "@/logo.svg"

function UserMenu() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
    )
  }

  if (!session) {
    return (
      <AuthDialog>
        <Button variant="outline">Entrar</Button>
      </AuthDialog>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full text-foreground/70 hover:text-foreground"
        aria-label="Configurações"
      >
        <span className="material-symbols-outlined" data-icon="settings">
          settings
        </span>
      </Button>
      <div className="h-10 w-10 rounded-full border-2 border-primary/50 overflow-hidden shadow-lg bg-card">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? "Avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm font-medium">
            {session.user.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
        )}
      </div>
    </div>
  )
}

export type LobbyTab = "Lobby" | "Vote" | "Board" | "History"

export interface TopNavBarProps {
  readonly activeTab: LobbyTab
  readonly onTabChange: (tab: LobbyTab) => void
}

const tabs: ReadonlyArray<LobbyTab> = ["Lobby", "Vote", "Board", "History"]
const tabLabels: Readonly<Record<LobbyTab, string>> = {
  Lobby: "Salão",
  Vote: "Voto",
  Board: "Quadro",
  History: "Histórico",
}

export function TopNavBar({ activeTab, onTabChange }: TopNavBarProps) {
  return (
    <header className="w-full top-0 sticky z-50 bg-background/80 backdrop-blur">
      <nav className="flex justify-between items-center px-6 py-4 w-full max-w-none mx-auto">
        <div className="flex items-center gap-2">
          <img src={logoSvg} alt="Hermes Scorer" className="h-8 w-8" />
          <span className="text-2xl font-bold tracking-tight text-primary">
            Hermes Scorer
          </span>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(tab) => onTabChange(tab as LobbyTab)}
          className="hidden md:flex md:w-auto"
        >
          <TabsList className="gap-1">
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab} aria-label={tabLabels[tab]}>
                {tabLabels[tab]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <UserMenu />
      </nav>
    </header>
  )
}
