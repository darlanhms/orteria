import { createFileRoute } from "@tanstack/react-router"

import { AuthDialog } from "@/components/AuthDialog"
import { Button } from "@/components/ui/button"
import { SessionScreen } from "@/features/session/SessionScreen"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/session/$sessionId")({
  component: SessionRoute,
})

function SessionRoute() {
  const { sessionId } = Route.useParams()
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="min-h-svh bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Validando autenticação...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-svh bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-muted-foreground">
            Você precisa estar autenticado para acessar a sessão.
          </p>
          <AuthDialog>
            <Button>Entrar com Google</Button>
          </AuthDialog>
        </div>
      </div>
    )
  }

  return <SessionScreen sessionId={sessionId} />
}

