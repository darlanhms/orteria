export type LobbyRecentRitual = {
  id: string
  title: string
  ageLabel: string
  participantsLabel: string
  // purely decorative for now
  isActive?: boolean
}

export type LobbyDeckOption = {
  id: "Fibonacci" | "T-Shirt" | "Linear"
  title: string
  description: string
  icon: string
}

export const lobbyDeckOptions: ReadonlyArray<LobbyDeckOption> = [
  {
    id: "Fibonacci",
    title: "Fibonacci",
    description: "0, 1, 2, 3, 5, 8, 13...",
    icon: "functions",
  },
  {
    id: "T-Shirt",
    title: "Camiseta",
    description: "RN, PP, P, M, G, GG, XGG",
    icon: "apparel",
  },
  {
    id: "Linear",
    title: "Linear",
    description: "1, 2, 3, 4, 5, 6, 7...",
    icon: "linear_scale",
  },
]

export const lobbyRecentRituals: ReadonlyArray<LobbyRecentRitual> = [
  {
    id: "backend-refactor-v2",
    title: "Refatoração de Backend V2",
    ageLabel: "há 2 horas",
    participantsLabel: "8 participantes",
    isActive: true,
  },
  {
    id: "mobile-ux-audit",
    title: "Auditoria de UX Mobile",
    ageLabel: "ontem",
    participantsLabel: "5 participantes",
  },
]

// Decorative avatars in the Stitch screenshot.
export const lobbyAvatars: ReadonlyArray<{ src: string; alt: string }> =
  [
    {
      alt: "Perfil de uma engenheira",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBopykJHKyPgZfICELQxyj1M9LCNB68g6QVfMSP4fBKHsGDiW7Ih-iaEMnNrmNS4f1RezZOQSoORmreCW1ddGK-GwLScG3ydQTQkbeVHxpql9frd-xLFpJsgf14zSPoVc-C5sYgLbVZdOXgjXC--B8l8ejElDrrsFMTDI8TP_KgAwqA0WDjHNvgqWVumT9Z14Mcbcb15PFznrltXN7oF6_jCYeOdMWuZBxAZAI6jwhALE4kaOrDHRu5cefAUjKKSVBMgfijzC7iNdhW",
    },
    {
      alt: "Perfil de um tech lead",
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4NSQEmFFWy1nUlpoyJNAKFFhmsktOdUN8OzfFUqYjRMtYj5Mv-w8xIwqzH3P5oFC3YvWw6tt1lzSNkopc7Bg8mg_slkj2WJNcbk6x1QeNcE3WCEBpPZwgEm6BK4-oTvToB5_U0X9hKalHHS_4n-sgnAsxQlTrN_QIYd_qwUlzhjewEt5SMWgGM2w-IyTFZlC25qrC2HYKvQWcAKVmVW9tKzgssYDljQOuzcVkAadn4bkllSQ6cyyvJWC1i3ZCTUL9SAZetgc6Lji3",
    },
  ]

export type MockVoteOptionId = "RN" | "PP" | "P" | "M" | "G" | "GG" | "XGG"

export type SessionVoteOption = {
  readonly id: MockVoteOptionId
  readonly label: string
  readonly sizingLabel: string
}

export type SessionParticipantStatus = "PRONTO" | "PENSANDO..." | "VOTADO"

export type SessionParticipant = {
  readonly id: string
  readonly name: string
  readonly role: string
  readonly status: SessionParticipantStatus
}

export type SessionStats = {
  readonly completionPercent: number
  readonly timeRemainingLabel: string
}

export type MockSession = {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly voteOptions: ReadonlyArray<SessionVoteOption>
  readonly participants: ReadonlyArray<SessionParticipant>
  readonly stats: SessionStats
}

const baseMockSession: Omit<MockSession, "id"> = {
  title: "Refatorar Payment Gateway Microservice",
  description:
    "Refine a lógica transacional com controle total de sentenças e melhora do tratamento de erros.",
  voteOptions: [
    { id: "RN", label: "RN", sizingLabel: "EXTRA PEQUENO" },
    { id: "PP", label: "PP", sizingLabel: "PEQUENO" },
    { id: "P", label: "P", sizingLabel: "MÉDIO-PEQUENO" },
    { id: "M", label: "M", sizingLabel: "MÉDIO" },
    { id: "G", label: "G", sizingLabel: "GRANDE" },
    { id: "GG", label: "GG", sizingLabel: "EXTRA GRANDE" },
    { id: "XGG", label: "XGG", sizingLabel: "EPICO" },
  ],
  participants: [
    { id: "alex-chen", name: "Alex Chen", role: "LEAD ARCHITECT", status: "PRONTO" },
    { id: "sarah-j", name: "Sarah Jenkins", role: "DEVOPS", status: "PENSANDO..." },
    { id: "marcus-v", name: "Marcus Voe", role: "BACKEND", status: "PRONTO" },
    { id: "john-doe", name: "John Doe (Você)", role: "FULLSTACK", status: "VOTADO" },
  ],
  stats: {
    completionPercent: 62,
    timeRemainingLabel: "1:42s",
  },
}

export function getMockSessionById(sessionId: string): MockSession {
  return {
    ...baseMockSession,
    id: sessionId,
  }
}

