import { createFileRoute } from "@tanstack/react-router"
import { TaskScorerLobbyPage } from "@/features/lobby/TaskScorerLobbyPage"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return <TaskScorerLobbyPage />
}
