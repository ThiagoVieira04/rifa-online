"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HiTicket, HiPlus, HiCollection, HiUserGroup, HiChartBar, HiClock } from "react-icons/hi"

interface DashboardStats {
  total: number
  active: number
  completed: number
  canceled: number
  totalParticipants: number
}

interface RaffleSummary {
  id: string
  title: string
  status: string
  createdAt: string
  creatorId: string
  _count: { participants: number }
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({ total: 0, active: 0, completed: 0, canceled: 0, totalParticipants: 0 })
  const [recentRaffles, setRecentRaffles] = useState<RaffleSummary[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/raffles?limit=50")
        if (!res.ok) return
        const data = await res.json()
        const raffles: RaffleSummary[] = data.raffles ?? []
        const userId = user?.id
        const userRaffles = raffles.filter((r) => r.creatorId === userId)

        setStats({
          total: userRaffles.length,
          active: userRaffles.filter((r) => r.status === "ACTIVE").length,
          completed: userRaffles.filter((r) => r.status === "COMPLETED").length,
          canceled: userRaffles.filter((r) => r.status === "CANCELED").length,
          totalParticipants: userRaffles.reduce((sum, r) => sum + r._count.participants, 0),
        })

        setRecentRaffles(userRaffles.slice(0, 5))
      } catch {
      } finally {
        setDataLoading(false)
      }
    }
    if (user?.id) {
      loadData()
    }
  }, [user])

  if (loading || dataLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-zinc-800 rounded w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-zinc-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const statCards = [
    { label: "Total de Rifas", value: stats.total, icon: HiTicket, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Rifas Ativas", value: stats.active, icon: HiChartBar, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Rifas Completadas", value: stats.completed, icon: HiCollection, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Total Participantes", value: stats.totalParticipants, icon: HiUserGroup, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Bem-vindo, {user.name ?? "Usuário"}
        </h1>
        <p className="text-zinc-400 mt-1">Gerencie suas rifas e sorteios</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">{card.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className={`${card.bg} p-3 rounded-xl`}>
                <card.icon className={card.color} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mb-10">
        <Link
          href="/dashboard/raffles/new"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
        >
          <HiPlus size={20} />
          Nova Rifa
        </Link>
        <Link
          href="/dashboard/raffles"
          className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <HiTicket size={20} />
          Ver Minhas Rifas
        </Link>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Atividades Recentes</h2>
        {recentRaffles.length === 0 ? (
          <div className="text-center py-8">
            <HiClock className="text-zinc-600 mx-auto mb-3" size={40} />
            <p className="text-zinc-500">Nenhuma rifa criada ainda.</p>
            <Link href="/dashboard/raffles/new" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">
              Criar sua primeira rifa
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRaffles.map((r) => (
              <Link
                key={r.id}
                href={`/dashboard/raffles/${r.id}/manage`}
                className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                <div>
                  <p className="text-white font-medium">{r.title}</p>
                  <p className="text-zinc-500 text-xs">{r._count.participants} participantes</p>
                </div>
                <span className="text-zinc-500 text-xs">{new Date(r.createdAt).toLocaleDateString("pt-BR")}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
