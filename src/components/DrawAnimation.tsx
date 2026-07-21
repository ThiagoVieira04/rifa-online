"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Confetti from "react-confetti"

interface DrawAnimationProps {
  onComplete: (number: number) => void
  isDrawing: boolean
  maxNumber: number
  minNumber: number
}

export function DrawAnimation({ onComplete, isDrawing, maxNumber, minNumber }: DrawAnimationProps) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [currentNumber, setCurrentNumber] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  const startDraw = useCallback(() => {
    setShowResult(false)
    setCurrentNumber(null)
    setCountdown(3)

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setTimeout(() => {
      const spinning = setInterval(() => {
        setCurrentNumber(Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber)
      }, 50)

      setTimeout(() => {
        clearInterval(spinning)
        const finalNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
        setCurrentNumber(finalNumber)
        setShowResult(true)
        setTimeout(() => {
          onComplete(finalNumber)
        }, 2000)
      }, 3000)
    }, 3000)
  }, [maxNumber, minNumber, onComplete])

  useEffect(() => {
    if (isDrawing) {
      startDraw()
    }
  }, [isDrawing, startDraw])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[400px]">
      {showResult && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />}

      <AnimatePresence mode="wait">
        {countdown !== null && countdown > 0 && (
          <motion.div
            key="countdown"
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="text-8xl font-bold text-white"
          >
            {countdown}
          </motion.div>
        )}

        {countdown === 0 && !showResult && currentNumber !== null && (
          <motion.div
            key="spinning"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-bold text-purple-400"
          >
            {String(currentNumber).padStart(2, "0")}
          </motion.div>
        )}

        {showResult && currentNumber !== null && (
          <motion.div
            key="result"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-center"
          >
            <div className="text-sm text-zinc-400 mb-2">Número Sorteado</div>
            <div className="text-9xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {String(currentNumber).padStart(2, "0")}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-green-400 text-lg font-medium"
            >
              Parabéns ao vencedor!
            </motion.div>
          </motion.div>
        )}

        {!isDrawing && countdown === null && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-zinc-500"
          >
            <div className="text-6xl mb-4 text-zinc-700">?</div>
            <p>Prepare-se para o sorteio</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
