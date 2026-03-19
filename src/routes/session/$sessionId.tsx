import { createFileRoute } from "@tanstack/react-router"

import { SessionScreen } from "@/features/session/SessionScreen"

export const Route = createFileRoute("/session/$sessionId")({
  component: SessionRoute,
})

function SessionRoute() {
  const { sessionId } = Route.useParams()

  return <SessionScreen sessionId={sessionId} />
}

