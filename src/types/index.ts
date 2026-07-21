export interface RaffleWithDetails {
  id: string
  title: string
  description: string | null
  prize: string
  prizeImage: string | null
  minNumbers: number
  maxNumbers: number
  drawDate: Date | null
  status: "ACTIVE" | "DRAWING" | "COMPLETED" | "CANCELED"
  winnerNumber: number | null
  winnerName: string | null
  allowMultipleWinners: boolean
  quantityWinners: number
  createdAt: Date
  updatedAt: Date
  creatorId: string
  creator: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  participants: ParticipantInfo[]
  draws: DrawInfo[]
  _count: {
    participants: number
  }
}

export interface ParticipantInfo {
  id: string
  number: number
  participantName: string
  participantPhone: string | null
  participantEmail: string | null
  createdAt: Date
}

export interface DrawInfo {
  id: string
  drawDate: Date
  drawnNumber: number
  winnerName: string | null
  reason: string | null
  isRedraw: boolean
  canceledAt: Date | null
  createdAt: Date
}

export interface DrawResult {
  success: boolean
  draw?: DrawInfo
  error?: string
  numbers?: number[]
  winners?: { number: number; winnerName: string }[]
}
