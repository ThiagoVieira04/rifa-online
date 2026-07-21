"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HiPlus, HiPencil, HiCog, HiTrash, HiTicket } from "react-icons/hi"
import toast from "react-hot-toast"

interface RaffleItem {
  id: string
  title: string
  status: string
  createdAt: string
  winnerNumber: number | null
  winnerName: string | null
  creatorId: string
  _count: { participants: number }
}

const statusTabs = ["Todas", "ACTIVE", "COMPLETED", "CANCELED"] as const

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativas",
  COMPLETED: "Completadas",
  CANCELED: "Canceladas",
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-400",
  DRAWING: "bg-yellow-500/10 text-yellow-400",
  COMPLETED: "bg-blue-500/10 text-blue-400",
  CANCELED: "bg-red-500/10 text-red-400",
}

export default function MyRafflesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [raffles, setRaffles] = useState<RaffleItem[]>([])
  const [filter, setFilter] = useState<string>("Todas")
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function loadRaffles() {
      try {
        const res = await fetch("/api/raffles?limit=100")
        if (!res.ok) throw new Error("Erro ao carregar")
        const data = await res.json()
        const allRaffles: RaffleItem[] = data.raffles ?? []
        const userId = user?.id
        const userRaffles = allRaffles.filter((r) => r.creatorId === userId)
        setRaffles(userRaffles)
      } catch {
        toast.error("Erro ao carregar rifas")
      } finally {
        setDataLoading(false)
      }
    }
    if (user?.id) {
      loadRaffles()
    }
  }, [user])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir a rifa "${title}"?`)) return
    try {
      const res = await fetch(`/api/raffles/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Erro ao excluir")
      setRaffles((prev) => prev.filter((r) => r.id !== id))
      toast.success("Rifa excluída!")
    } catch {
      toast.error("Erro ao excluir rifa")
    }
  }

  const filtered = filter === "Todas" ? raffles : raffles.filter((r) => r.status === filter)

  if (loading || dataLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-1/4" />
          <div className="h-10 bg-zinc-800 rounded w-96" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-zinc-800 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Minhas Rifas</h1>
        <Link
          href="/dashboard/raffles/new"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200"
        >
          <HiPlus size={20} />
          Nova Rifa
        </Link>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab
                ? "bg-purple-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            {tab === "Todas" ? "Todas" : statusLabels[tab]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-zinc-800/50 border border-zinc-700 rounded-xl">
          <HiTicket className="text-zinc-600 mx-auto mb-4" size={48} />
          <p className="text-zinc-500 text-lg mb-2">Nenhuma rifa encontrada</p>
          <Link href="/dashboard/raffles/new" className="text-purple-400 hover:text-purple-300">
            Criar nova rifa
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-400">
                <th className="text-left py-3 px-3">Título</th>
                <th className="text-left py-3 px-3">Status</th>
                <th className="text-left py-3 px-3">Participantes</th>
                <th className="text-left py-3 px-3">Criada em</th>
                <th className="text-right py-3 px-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-zinc-700/50 hover:bg-zinc-800/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="text-white font-medium">{r.title}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[r.status] ?? ""}`}>
                      {statusLabels[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-400">{r._count.participants}</td>
                  <td className="py-3 px-3 text-zinc-500">{new Date(r.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/raffles/${r.id}/edit`}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <HiPencil size={16} />
                      </Link>
                      <Link
                        href={`/dashboard/raffles/${r.id}/manage`}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                        title="Gerenciar"
                      >
                        <HiCog size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(r.id, r.title)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <HiTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
