import type { AccessKeyDigit } from "../useTaskScorerLobbyController"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface JoinSessionSectionProps {
  readonly accessKey: ReadonlyArray<AccessKeyDigit>
  readonly inputRefs: React.MutableRefObject<Array<HTMLInputElement | null>>
  readonly isEnterAtriumEnabled: boolean
  readonly isJoiningAtrium: boolean
  readonly onAccessKeyChange: (index: number, value: string) => void
  readonly onAccessKeyKeyDown: (index: number, key: string) => void
  readonly onJoinAtrium: () => void
}

export function JoinSessionSection({
  accessKey,
  inputRefs,
  isEnterAtriumEnabled,
  isJoiningAtrium,
  onAccessKeyChange,
  onAccessKeyKeyDown,
  onJoinAtrium,
}: JoinSessionSectionProps) {
  return (
    <Card className="lg:col-span-5 border-l-4 border-l-secondary relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
        <span className="material-symbols-outlined text-8xl text-secondary">
          rocket_launch
        </span>
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="text-2xl flex items-center gap-3 text-primary">
          <span className="material-symbols-outlined text-secondary">key</span>
          Entrar em uma Sessão
        </CardTitle>
        <CardDescription>
          Use uma chave de 6 dígitos para acessar um ritual em andamento.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 relative">
        <div>
          <Label className="mb-3 block">
            Chave de Acesso de 6 Dígitos
          </Label>
          <div className="flex gap-2">
            {accessKey.map((digit, idx) => (
              <Input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el
                }}
                data-testid={`access-key-input-${idx}`}
                className="w-12 h-14 bg-muted text-center text-2xl font-bold text-secondary px-0"
                inputMode="numeric"
                maxLength={1}
                placeholder="•"
                value={digit}
                onChange={(e) => onAccessKeyChange(idx, e.target.value)}
                onKeyDown={(e) => onAccessKeyKeyDown(idx, e.key)}
              />
            ))}
          </div>
        </div>

        <Button
          variant="secondary"
          size="lg"
          disabled={!isEnterAtriumEnabled || isJoiningAtrium}
          onClick={onJoinAtrium}
          className="w-full h-auto py-4 font-extrabold text-lg"
        >
          {isJoiningAtrium ? "Entrando no Atrium..." : "Entrar no Atrium"}
        </Button>

        <p className="text-sm text-center text-muted-foreground italic">
          "A precisão é o ritmo do progresso."
        </p>
      </CardContent>
    </Card>
  )
}

