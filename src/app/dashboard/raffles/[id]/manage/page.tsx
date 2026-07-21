"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { HiArrowLeft, HiPlay, HiTable, HiTicket, HiUserGroup, HiChartBar } from "react-icons/hi"
import toast from "react-hot-toast"
import * as XLSX from "xlsx"

interface Participant {
  id: string
  number: number
  participantName: string
  participantPhone: string | null
  participantEmail: string | null
  createdAt: string
}

interface RaffleManage {
  id: string
  title: string
  prize: string
  status: string
  minNumbers: number
  maxNumbers: number
  creatorId: string
  _count: { participants: number }
  participants: Participant[]
}

export default function ManageRafflePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [raffle, setRaffle] = useState<RaffleManage | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  const loadRaffle = useCallback(async () => {
    try {
      const res = await fetch(`/api/raffles/${id}`)
      if (!res.ok) throw new Error("Erro ao carregar")
      const data = await res.json()
      if (data.creatorId !== user?.id) {
        toast.error("Você não tem permissão")
        router.push("/dashboard/raffles")
        return
      }
      setRaffle(data)
    } catch {
      toast.error("Erro ao carregar rifa")
      router.push("/dashboard/raffles")
    } finally {
      setDataLoading(false)
    }
  }, [id, user, router])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user?.id) {
      loadRaffle()
    }
  }, [user, loadRaffle])

  const exportExcel = () => {
    if (!raffle) return
    const wb = XLSX.utils.book_new()
    const wsData = [
      ["Número", "Nome", "Telefone", "Email"],
      ...raffle.participants.map((p) => [
        p.number,
        p.participantName,
        p.participantPhone ?? "",
        p.participantEmail ?? "",
      ]),
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    XLSX.utils.book_append_sheet(wb, ws, "Participantes")
    XLSX.writeFile(wb, `participantes-${raffle.title.replace(/\s+/g, "-").toLowerCase()}.xlsx`)
    toast.success("Planilha exportada!")
  }

  if (loading || dataLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-1/3" />
          <div className="h-64 bg-zinc-800 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!user || !raffle) return null

  const totalNumbers = raffle.maxNumbers - raffle.minNumbers + 1
  const soldNumbers = raffle.participants.length
  const availableNumbers = totalNumbers - soldNumbers

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/dashboard/raffles" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <HiArrowLeft size={20} />
        Voltar
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{raffle.title}</h1>
          <p className="text-zinc-400 mt-1">{raffle.prize}</p>
        </div>
        <Link
          href={`/raffle/${raffle.id}/draw`}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200"
        >
          <HiPlay size={20} />
          Iniciar Sorteio
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/10 p-3 rounded-xl">
              <HiTicket className="text-purple-400" size={20} />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Total de Números</p>
              <p className="text-2xl font-bold text-white">{totalNumbers}</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-3 rounded-xl">
              <HiChartBar className="text-green-400" size={20} />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Números Vendidos</p>
              <p className="text-2xl font-bold text-white">{soldNumbers}</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-3 rounded-xl">
              <HiUserGroup className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Números Disponíveis</p>
              <p className="text-2xl font-bold text-white">{availableNumbers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-white">Participantes</h2>
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <HiTable size={16} />
            Exportar Excel
          </button>
        </div>

        {raffle.participants.length === 0 ? (
          <div className="text-center py-12">
            <HiUserGroup className="text-zinc-600 mx-auto mb-3" size={40} />
            <p className="text-zinc-500">Nenhum participante ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400">
                  <th className="text-left py-3 px-3">Número</th>
                  <th className="text-left py-3 px-3">Nome</th>
                  <th className="text-left py-3 px-3">Telefone</th>
                  <th className="text-left py-3 px-3">Email</th>
                  <th className="text-left py-3 px-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {raffle.participants.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-700/50 text-zinc-300">
                    <td className="py-3 px-3 font-semibold text-white">{String(p.number).padStart(2, "0")}</td>
                    <td className="py-3 px-3">{p.participantName}</td>
                    <td className="py-3 px-3">{p.participantPhone ?? "-"}</td>
                    <td className="py-3 px-3">{p.participantEmail ?? "-"}</td>
                    <td className="py-3 px-3 text-zinc-500">{new Date(p.createdAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
