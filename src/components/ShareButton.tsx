"use client"

import { useState } from "react"
import { FiShare2 } from "react-icons/fi"
import toast from "react-hot-toast"

interface ShareButtonProps {
  title: string
  text?: string
  url?: string
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [loading, setLoading] = useState(false)
  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "")

  async function handleShare() {
    setLoading(true)
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: shareUrl })
        toast.success("Compartilhado com sucesso!")
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Link copiado para a área de transferência!")
      }
    } catch {
      toast.error("Não foi possível compartilhar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      <FiShare2 size={16} />
      {loading ? "Compartilhando..." : "Compartilhar"}
    </button>
  )
}
