import { useMemo, useRef, useState } from "react"

export type AccessKeyDigit = "" | string

export type LobbyTab = "Lobby" | "Vote" | "Board" | "History"
export type LobbyDeck = "Fibonacci" | "T-Shirt" | "Linear"

export function useTaskScorerLobbyController() {
  // Access Key input state (6 digits).
  const [accessKey, setAccessKey] = useState<Array<AccessKeyDigit>>(
    Array.from({ length: 6 }, () => ""),
  )
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  // UI state
  const [activeTab, setActiveTab] = useState<LobbyTab>("Lobby")
  const [sessionIdentity, setSessionIdentity] = useState("")
  const [selectedDeck, setSelectedDeck] = useState<LobbyDeck>("Fibonacci")

  const [isJoiningAtrium, setIsJoiningAtrium] = useState(false)
  const [isManifesting, setIsManifesting] = useState(false)

  const isEnterAtriumEnabled = useMemo(
    () => accessKey.every((d) => d.length === 1 && /\d/.test(d)),
    [accessKey],
  )

  const canManifestSession = useMemo(() => {
    return sessionIdentity.trim().length > 0 && selectedDeck.length > 0
  }, [sessionIdentity, selectedDeck])

  const focusIndex = (index: number) => {
    inputRefs.current[index]?.focus()
  }

  const setDigitAt = (index: number, nextDigit: string) => {
    setAccessKey((prev) => {
      const updated = [...prev]
      updated[index] = nextDigit
      return updated
    })
  }

  function handleAccessKeyChange(index: number, value: string) {
    // Keep only last numeric character, so pastes are handled gracefully.
    const digit = value.replace(/\D/g, "").slice(-1)
    setDigitAt(index, digit)

    if (digit && index < 5) {
      // Move forward after the digit is set.
      requestAnimationFrame(() => focusIndex(index + 1))
    }
  }

  function handleAccessKeyKeyDown(index: number, key: string) {
    if (key !== "Backspace") return
    if (accessKey[index] !== "") return
    if (index <= 0) return

    requestAnimationFrame(() => focusIndex(index - 1))
  }

  function handleJoinAtrium() {
    if (!isEnterAtriumEnabled) return
    if (isJoiningAtrium) return

    setIsJoiningAtrium(true)
    window.setTimeout(() => {
      setIsJoiningAtrium(false)
    }, 700)
  }

  function handleManifestSession() {
    if (!canManifestSession) return
    if (isManifesting) return

    setIsManifesting(true)
    window.setTimeout(() => {
      setIsManifesting(false)
    }, 800)
  }

  return {
    // state
    accessKey,
    inputRefs,
    activeTab,
    sessionIdentity,
    selectedDeck,
    isJoiningAtrium,
    isManifesting,
    // derived
    isEnterAtriumEnabled,
    canManifestSession,
    // handlers
    setActiveTab,
    setSessionIdentity,
    setSelectedDeck,
    handleAccessKeyChange,
    handleAccessKeyKeyDown,
    handleJoinAtrium,
    handleManifestSession,
  }
}

