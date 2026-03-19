import { describe, expect, it } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"

import { TaskScorerLobbyPage } from "../TaskScorerLobbyPage"

describe("TaskScorerLobbyPage", () => {
  it("renders shadcn card and tabs primitives", () => {
    const { container } = render(<TaskScorerLobbyPage />)

    expect(screen.getByRole("tablist")).toBeTruthy()
    expect(container.querySelectorAll('[data-slot="card"]').length).toBeGreaterThanOrEqual(2)
  })

  it("keeps 'Entrar no Atrium' disabled until 6 access key digits are entered", () => {
    render(<TaskScorerLobbyPage />)

    const enterAtriumButton = screen.getAllByRole("button", {
      name: /entrar no atrium/i,
    })[0]

    if (!(enterAtriumButton instanceof HTMLButtonElement)) {
      throw new Error(
        "Expected Entrar no Atrium button to be an HTMLButtonElement",
      )
    }

    expect(enterAtriumButton.disabled).toBe(true)

    const inputs = Array.from(
      { length: 6 },
      (_, idx) => screen.getAllByTestId(`access-key-input-${idx}`)[0],
    )

    inputs.forEach((input, idx) => {
      fireEvent.change(input, { target: { value: String(idx) } })
    })

    expect(enterAtriumButton.disabled).toBe(false)
  })
})

