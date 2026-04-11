import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { TaskScorerLobbyPage } from "../TaskScorerLobbyPage"

describe("TaskScorerLobbyPage", () => {
  it("renders shadcn card and tabs primitives", () => {
    const { container } = render(<TaskScorerLobbyPage />)

    expect(screen.getByRole("tablist")).toBeTruthy()
    expect(container.querySelectorAll('[data-slot="card"]').length).toBeGreaterThanOrEqual(1)
  })

  it("does not render join-by-key section on home", () => {
    render(<TaskScorerLobbyPage />)

    expect(screen.queryByText(/entrar em uma sessão/i)).toBeNull()
    expect(screen.queryByText(/entrar no atrium/i)).toBeNull()
  })
})

