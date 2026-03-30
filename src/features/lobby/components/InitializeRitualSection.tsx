import { DeckOptionCard } from "./DeckOptionCard"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type LobbyDeck = "Fibonacci" | "T-Shirt" | "Linear"
const deckTypes = ["Fibonacci", "T-Shirt", "Linear"] as const

const initializeRitualSchema = z.object({
  sessionIdentity: z.string().trim().min(1, "Informe o nome da sessão"),
  memberName: z.string().trim().min(1, "Informe seu nome no ritual"),
  deckType: z.enum(deckTypes),
})

export type InitializeRitualFormValues = z.infer<typeof initializeRitualSchema>

const lobbyDeckOptions = [
  { id: "Fibonacci" as const, title: "Fibonacci", description: "0, 1, 2, 3, 5, 8, 13...", icon: "functions" },
  { id: "T-Shirt" as const, title: "Camiseta", description: "RN, PP, P, M, G, GG, XGG", icon: "apparel" },
  { id: "Linear" as const, title: "Linear", description: "1, 2, 3, 4, 5, 6, 7...", icon: "linear_scale" },
]

export interface InitializeRitualSectionProps {
  readonly isManifesting: boolean
  readonly submitError?: string | null
  readonly onManifestSession: (values: InitializeRitualFormValues) => Promise<void>
}

export function InitializeRitualSection({
  isManifesting,
  submitError,
  onManifestSession,
}: InitializeRitualSectionProps) {
  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<InitializeRitualFormValues>({
    resolver: zodResolver(initializeRitualSchema),
    mode: "onChange",
    defaultValues: {
      sessionIdentity: "",
      memberName: "",
      deckType: "Fibonacci",
    },
  })

  const selectedDeck = watch("deckType")
  const canManifestSession = isValid

  const submit = handleSubmit(async (values) => {
    await onManifestSession(values)
  })

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

      <CardContent>
        <form className="space-y-8" onSubmit={submit}>
        {/* Session identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>
                Nome da Sessão
              </Label>
              <Input
                className="h-12 bg-muted px-4 text-base"
                placeholder="Sprint 42: O Despertar"
                {...register("sessionIdentity")}
              />
              {errors.sessionIdentity && (
                <p className="text-sm text-destructive">{errors.sessionIdentity.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                Seu Nome no Ritual
              </Label>
              <Input
                className="h-12 bg-muted px-4 text-base"
                placeholder="Ex: Darlan"
                {...register("memberName")}
              />
              {errors.memberName && (
                <p className="text-sm text-destructive">{errors.memberName.message}</p>
              )}
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
                onSelect={(deck) =>
                  setValue("deckType", deck, { shouldDirty: true, shouldValidate: true })
                }
              />
            ))}
          </div>
          </div>

        {/* Manifest + participant avatars */}
          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}
          <div className="pt-4 flex items-center justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={!canManifestSession || isManifesting}
              className="h-auto px-10 py-4 font-extrabold shadow-xl"
            >
              {isManifesting ? "Iniciando..." : "Iniciar novo ritual"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
