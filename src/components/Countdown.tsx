"use client"

import { useState, useEffect } from "react"

interface CountdownProps {
  until: Date
  onEnd?: () => void
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(until: Date): TimeLeft {
  const diff = until.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function Countdown({ until, onEnd }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(until))

  useEffect(() => {
    const interval = setInterval(() => {
      const tl = calculateTimeLeft(until)
      setTimeLeft(tl)
      if (tl.days === 0 && tl.hours === 0 && tl.minutes === 0 && tl.seconds === 0) {
        clearInterval(interval)
        onEnd?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [until, onEnd])

  const pads = [
    { label: "Dias", value: timeLeft.days },
    { label: "Horas", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Seg", value: timeLeft.seconds },
  ]

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return <span className="text-lg font-semibold text-red-500">Encerrado</span>
  }

  return (
    <div className="flex items-center gap-3">
      {pads.map(({ label, value }) => (
        <div key={label} className="text-center">
          <div className="bg-gray-100 rounded-lg px-3 py-1.5 min-w-[48px]">
            <span className="text-lg font-bold text-gray-900">
              {String(value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs text-gray-500 mt-0.5 block">{label}</span>
        </div>
      ))}
    </div>
  )
}
