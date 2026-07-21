"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { useRouter } from "next/navigation"
import { HiTicket, HiCalendar, HiMail, HiUser, HiPhone } from "react-icons/hi"

interface RaffleSummary {
  id: string
  creatorId: string
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [raffleCount, setRaffleCount] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/raffles?limit=100")
        if (!res.ok) return
        const data = await res.json()
        const allRaffles: RaffleSummary[] = data.raffles ?? []
        const userId = user?.id
        setRaffleCount(allRaffles.filter((r) => r.creatorId === userId).length)
      } catch {}
    }
    if (user?.id) {
      loadStats()
    }
  }, [user])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-zinc-800 rounded-full" />
            <div className="space-y-2">
              <div className="h-6 bg-zinc-800 rounded w-40" />
              <div className="h-4 bg-zinc-800 rounded w-60" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-8">Meu Perfil</h1>

      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-6">
          {user.image ? (
            <img src={user.image} alt="" className="w-20 h-20 rounded-full border-2 border-purple-500/30" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <HiUser className="text-white" size={36} />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-white">{user.name ?? "Usuário"}</h2>
            <div className="flex items-center gap-2 text-zinc-400 mt-1">
              <HiMail size={16} />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-zinc-400 mt-1">
                <HiPhone size={16} />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-1">
            <HiCalendar className="text-purple-400" size={20} />
            <span className="text-zinc-400 text-sm">Membro desde</span>
          </div>
          <p className="text-white font-semibold">
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString("pt-BR")
              : new Date().getFullYear().toString()}
          </p>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-1">
            <HiTicket className="text-purple-400" size={20} />
            <span className="text-zinc-400 text-sm">Rifas Criadas</span>
          </div>
          <p className="text-white font-semibold text-2xl">{raffleCount}</p>
        </div>
      </div>
    </div>
  )
}
