"use client"

import { useEffect, useState } from "react"
import Confetti from "react-confetti"

interface ConfettiEffectProps {
  active: boolean
}

export default function ConfettiEffect({ active }: ConfettiEffectProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [show, setShow] = useState(false)

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (active) {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 5000)
      return () => clearTimeout(timer)
    }
    setShow(false)
  }, [active])

  if (!show) return null

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      recycle={false}
      numberOfPieces={300}
      gravity={0.15}
    />
  )
}
