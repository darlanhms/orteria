import { createFileRoute } from "@tanstack/react-router"

type ClickUpTaskResponse = {
  name?: string
  parent?: string | { id?: string } | null
}

async function fetchClickUpTask(
  taskId: string,
  apiKey: string,
): Promise<{ ok: true; payload: ClickUpTaskResponse } | { ok: false; status: number }> {
  const response = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
    method: "GET",
    headers: {
      Authorization: apiKey,
      accept: "application/json",
    },
  })

  if (!response.ok) {
    return { ok: false, status: response.status }
  }

  const payload = (await response.json()) as ClickUpTaskResponse
  return { ok: true, payload }
}

export const Route = createFileRoute("/api/clickup/task")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { searchParams } = new URL(request.url)
        const taskId = searchParams.get("taskId")?.trim()

        if (!taskId) {
          return Response.json({ error: "taskId is required" }, { status: 400 })
        }

        const clickUpApiKey = process.env.CLICKUP_API_KEY
        if (!clickUpApiKey) {
          return Response.json({ error: "CLICKUP_API_KEY not configured" }, { status: 500 })
        }

        const taskResult = await fetchClickUpTask(taskId, clickUpApiKey)
        if (!taskResult.ok) {
          return Response.json(
            { error: "Failed to fetch ClickUp task" },
            { status: taskResult.status },
          )
        }

        const payload = taskResult.payload
        const name = payload.name?.trim()

        if (!name) {
          return Response.json({ error: "Task name is empty" }, { status: 422 })
        }

        const parentId =
          typeof payload.parent === "string"
            ? payload.parent
            : payload.parent?.id
              ? payload.parent.id
              : null

        if (!parentId) {
          return Response.json({ name }, { status: 200 })
        }

        const parentResult = await fetchClickUpTask(parentId, clickUpApiKey)
        if (!parentResult.ok) {
          // If parent lookup fails, keep the subtask name.
          return Response.json({ name }, { status: 200 })
        }

        const parentPayload = parentResult.payload
        const parentName = parentPayload.name?.trim()
        if (!parentName) {
          return Response.json({ name }, { status: 200 })
        }

        return Response.json({ name: `${parentName} - ${name}` }, { status: 200 })
      },
    },
  },
})
