import { describe, expect, it } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"

import { SessionScreen } from "../SessionScreen"

describe("SessionScreen", () => {
  it("renders session areas as shadcn cards", () => {
    const { container } = render(<SessionScreen sessionId="TICKET-4421" />)

    expect(screen.getByRole("tablist")).toBeTruthy()
    expect(container.querySelectorAll('[data-slot="card"]').length).toBeGreaterThanOrEqual(3)
  })

  it("allows selecting a vote, revealing and resetting", () => {
    render(<SessionScreen sessionId="TICKET-4421" />)

    const mButton = screen.getAllByTestId("vote-option-M")[0]

    expect(mButton.getAttribute("aria-pressed")).toBe("false")
    expect(mButton.hasAttribute("disabled")).toBe(false)

    fireEvent.click(mButton)
    expect(mButton.getAttribute("aria-pressed")).toBe("true")

    const actionButton = screen.getAllByRole("button", { name: /pronto/i })[0]
    fireEvent.click(actionButton)

    expect(mButton.hasAttribute("disabled")).toBe(true)
    expect(actionButton.textContent).toBe("Repensar")

    fireEvent.click(actionButton)

    expect(mButton.hasAttribute("disabled")).toBe(false)
    expect(mButton.getAttribute("aria-pressed")).toBe("false")
    expect(actionButton.textContent).toBe("Pronto")
  })
})

