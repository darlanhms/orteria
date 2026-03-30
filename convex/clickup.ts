import { v } from "convex/values"
import { action } from "./_generated/server"

type ClickUpTaskResponse = {
  name?: string
  parent?: string | { id?: string } | null
}

async function fetchClickUpTask(
  taskId: string,
  apiKey: string,
): Promise<{ ok: true; payload: ClickUpTaskResponse } | { ok: false; status: number; body: string }> {
  const response = await fetch(`https://api.clickup.com/api/v2/task/${encodeURIComponent(taskId)}`, {
    method: "GET",
    headers: {
      Authorization: apiKey,
      accept: "application/json",
    },
  })

  if (!response.ok) {
    return { ok: false, status: response.status, body: await response.text() }
  }

  const payload = (await response.json()) as ClickUpTaskResponse
  return { ok: true, payload }
}

export const getClickUpTask = action({
  args: {
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const taskId = args.taskId.trim()
    if (taskId.length === 0) {
      throw new Error("ClickUp task id is required")
    }

    const clickUpApiKey = process.env.CLICKUP_API_KEY
    if (!clickUpApiKey) {
      throw new Error("CLICKUP_API_KEY not configured")
    }

    const taskResult = await fetchClickUpTask(taskId, clickUpApiKey)
    if (!taskResult.ok) {
      throw new Error(`Failed to fetch ClickUp task: ${taskResult.status} ${taskResult.body}`)
    }

    const taskName = taskResult.payload.name?.trim()
    if (!taskName) {
      throw new Error("Task name is empty")
    }

    const parentId =
      typeof taskResult.payload.parent === "string"
        ? taskResult.payload.parent
        : taskResult.payload.parent?.id
          ? taskResult.payload.parent.id
          : null

    if (!parentId) {
      return { name: taskName, clickUpId: taskId }
    }

    const parentResult = await fetchClickUpTask(parentId, clickUpApiKey)
    if (!parentResult.ok) {
      return { name: taskName, clickUpId: taskId }
    }

    const parentName = parentResult.payload.name?.trim()
    if (!parentName) {
      return { name: taskName, clickUpId: taskId }
    }

    return { name: `${parentName} - ${taskName}`, clickUpId: taskId }
  },
})

export const setClickUpCustomFieldValue = action({
  args: {
    taskId: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const taskId = args.taskId.trim()
    const value = args.value.trim()
    if (taskId.length === 0) {
      throw new Error("ClickUp task id is required")
    }
    if (value.length === 0) {
      throw new Error("Custom field value is required")
    }

    const clickUpApiKey = process.env.CLICKUP_API_KEY
    const clickUpFieldId = process.env.CLICKUP_SCORE_CUSTOM_FIELD_ID
    if (!clickUpApiKey) {
      throw new Error("CLICKUP_API_KEY not configured")
    }
    if (!clickUpFieldId) {
      throw new Error("CLICKUP_SCORE_CUSTOM_FIELD_ID not configured")
    }

    const response = await fetch(
      `https://api.clickup.com/api/v2/task/${encodeURIComponent(taskId)}/field/${encodeURIComponent(clickUpFieldId)}`,
      {
        method: "POST",
        headers: {
          Authorization: clickUpApiKey,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          value,
        }),
      },
    )

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Failed to set ClickUp custom field: ${response.status} ${body}`)
    }

    return { success: true }
  },
})
