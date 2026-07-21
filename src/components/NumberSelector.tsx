"use client"

import { useState } from "react"

interface Participant {
  number: number
  participantName: string
  participantPhone: string | null
  participantEmail: string | null
}

interface NumberSelectorProps {
  minNumbers: number
  maxNumbers: number
  participants: Participant[]
  winnerNumber: number | null
  status: string
}

export function NumberSelector({ minNumbers, maxNumbers, participants, winnerNumber, status }: NumberSelectorProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)

  const takenNumbers = participants.map((p) => p.number)

  const getParticipant = (num: number) => participants.find((p) => p.number === num)

  const isTaken = (num: number) => takenNumbers.includes(num)
  const isWinner = (num: number) => num === winnerNumber

  return (
    <div>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {Array.from({ length: maxNumbers - minNumbers + 1 }, (_, i) => minNumbers + i).map((num) => {
          const taken = isTaken(num)
          const winner = isWinner(num)
          const participant = getParticipant(num)

          return (
            <button
              key={num}
              onClick={() => {
                if (taken) {
                  setSelectedNumber(selectedNumber === num ? null : num)
                }
              }}
              disabled={status === "COMPLETED" || status === "CANCELED"}
              className={`
                relative aspect-square rounded-lg text-sm font-medium transition-all duration-200
                ${winner
                  ? "bg-yellow-500 text-yellow-950 border-2 border-yellow-400 shadow-lg shadow-yellow-500/20 scale-110 z-10"
                  : taken
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 cursor-pointer hover:bg-purple-600/30"
                    : status === "COMPLETED" || status === "CANCELED"
                      ? "bg-zinc-800/50 text-zinc-600 border border-zinc-700 cursor-not-allowed"
                      : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-500 cursor-pointer"
                }
              `}
            >
              <span className="absolute inset-0 flex items-center justify-center">{String(num).padStart(2, "0")}</span>
            </button>
          )
        })}
      </div>

      {selectedNumber && getParticipant(selectedNumber) && (
        <div className="mt-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
          <p className="text-zinc-400 text-sm">
            <span className="text-white font-medium">Número {selectedNumber}</span> &mdash;{" "}
            {getParticipant(selectedNumber)?.participantName}
            {getParticipant(selectedNumber)?.participantPhone && <> &bull; {getParticipant(selectedNumber)?.participantPhone}</>}
            {getParticipant(selectedNumber)?.participantEmail && <> &bull; {getParticipant(selectedNumber)?.participantEmail}</>}
          </p>
        </div>
      )}
    </div>
  )
}
