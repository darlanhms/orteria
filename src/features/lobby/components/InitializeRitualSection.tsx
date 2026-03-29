import { DeckOptionCard } from "./DeckOptionCard"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type LobbyDeck = "Fibonacci" | "T-Shirt" | "Linear"

const lobbyDeckOptions = [
  { id: "Fibonacci" as const, title: "Fibonacci", description: "0, 1, 2, 3, 5, 8, 13...", icon: "functions" },
  { id: "T-Shirt" as const, title: "Camiseta", description: "RN, PP, P, M, G, GG, XGG", icon: "apparel" },
  { id: "Linear" as const, title: "Linear", description: "1, 2, 3, 4, 5, 6, 7...", icon: "linear_scale" },
]

export interface InitializeRitualSectionProps {
  readonly sessionIdentity: string
  readonly selectedDeck: LobbyDeck
  readonly canManifestSession: boolean
  readonly isManifesting: boolean
  readonly onSessionIdentityChange: (value: string) => void
  readonly onDeckSelect: (deck: LobbyDeck) => void
  readonly onManifestSession: () => void
}

export function InitializeRitualSection({
  sessionIdentity,
  selectedDeck,
  canManifestSession,
  isManifesting,
  onSessionIdentityChange,
  onDeckSelect,
  onManifestSession,
}: InitializeRitualSectionProps) {
  return (
    <Card className="lg:col-span-7 border-t border-t-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          Iniciar Novo Ritual
        </CardTitle>
        <CardDescription>
          Defina o nome da sessão e o tipo de estimativa antes de iniciar.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Session identity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>
              Nome da Sessão
            </Label>
            <Input
              className="h-12 bg-muted px-4 text-base"
              placeholder="Sprint 42: O Despertar"
              value={sessionIdentity}
              onChange={(e) => onSessionIdentityChange(e.target.value)}
            />
          </div>
        </div>

        {/* Deck selection */}
        <div className="space-y-4">
          <Label>
            Tipo de Estimativa
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {lobbyDeckOptions.map((opt) => (
              <DeckOptionCard
                key={opt.id}
                deckId={opt.id}
                title={opt.title}
                description={opt.description}
                icon={opt.icon}
                isSelected={selectedDeck === opt.id}
                onSelect={onDeckSelect}
              />
            ))}
          </div>
        </div>

        {/* Manifest + participant avatars */}
        <div className="pt-4 flex items-center justify-end">
          <Button
            size="lg"
            disabled={!canManifestSession || isManifesting}
            onClick={onManifestSession}
            className="h-auto px-10 py-4 font-extrabold shadow-xl"
          >
            {isManifesting ? "Iniciando..." : "Iniciar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
