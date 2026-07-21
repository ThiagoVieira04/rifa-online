"use client"

import { useState, useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { HiArrowLeft, HiDocumentText, HiTable, HiBan, HiRefresh, HiCheck } from "react-icons/hi"
import { DrawAnimation } from "@/components/DrawAnimation"
import toast from "react-hot-toast"
import { useAuth } from "@/providers/AuthProvider"
import Link from "next/link"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

interface DrawRecord {
  id: string
  drawDate: string
  drawnNumber: number
  winnerName: string | null
  reason: string | null
  isRedraw: boolean
  canceledAt: string | null
  createdAt: string
}

interface RaffleData {
  id: string
  title: string
  prize: string
  prizeImage: string | null
  minNumbers: number
  maxNumbers: number
  status: string
  winnerNumber: number | null
  winnerName: string | null
  creatorId: string
  creator: { id: string; name: string | null }
  participants: { id: string; number: number; participantName: string; participantPhone: string | null; participantEmail: string | null }[]
  draws: DrawRecord[]
  _count: { participants: number }
}

export default function DrawPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const [raffle, setRaffle] = useState<RaffleData | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)

  const loadRaffle = useCallback(async () => {
    try {
      const res = await fetch(`/api/raffles/${id}`)
      if (!res.ok) throw new Error("Erro")
      const data = await res.json()
      setRaffle(data)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadRaffle()
    const interval = setInterval(loadRaffle, 5000)
    return () => clearInterval(interval)
  }, [loadRaffle])
  const [drawResult, setDrawResult] = useState<{ number: number; winnerName: string } | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [showRedrawModal, setShowRedrawModal] = useState(false)
  const [redrawReason, setRedrawReason] = useState("")

  const isAdmin = user?.id === raffle?.creatorId

  const handleDrawComplete = useCallback(async (number: number) => {
    try {
      const res = await fetch(`/api/raffles/${id}/draw`, { method: "POST" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao realizar sorteio")
      }
      const data = await res.json()
      const winner = data.winners?.[0] ?? data.draw ?? { drawnNumber: number, winnerName: "Desconhecido" }
      setDrawResult({ number: winner.drawnNumber ?? number, winnerName: winner.winnerName ?? "Desconhecido" })
      toast.success("Sorteio realizado com sucesso!")
      loadRaffle()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao realizar sorteio")
    } finally {
      setIsDrawing(false)
    }
  }, [id, loadRaffle])

  const handleStartDraw = () => {
    setIsDrawing(true)
    setDrawResult(null)
  }

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Informe o motivo do cancelamento")
      return
    }
    try {
      const res = await fetch(`/api/raffles/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      })
      if (!res.ok) throw new Error("Erro ao cancelar")
      toast.success("Resultado cancelado!")
      setShowCancelModal(false)
      setCancelReason("")
      setDrawResult(null)
      loadRaffle()
    } catch {
      toast.error("Erro ao realizar novo sorteio")
    }
  }

  const handleRedraw = async () => {
    if (!redrawReason.trim()) {
      toast.error("Informe o motivo do novo sorteio")
      return
    }
    try {
      const res = await fetch(`/api/raffles/${id}/redraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: redrawReason }),
      })
      if (!res.ok) throw new Error("Erro ao realizar novo sorteio")
      const data = await res.json()
      const winner = data.winners?.[0] ?? data.draw ?? {}
      setDrawResult({ number: winner.drawnNumber, winnerName: winner.winnerName ?? "Desconhecido" })
      toast.success("Novo sorteio realizado!")
      setShowRedrawModal(false)
      setRedrawReason("")
      loadRaffle()
    } catch {
      toast.error("Erro ao realizar novo sorteio")
    }
  }

  const exportPDF = () => {
    if (!raffle) return
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text("Resultado do Sorteio", 14, 22)
    doc.setFontSize(12)
    doc.text(`Rifa: ${raffle.title}`, 14, 32)
    doc.text(`Prêmio: ${raffle.prize}`, 14, 40)
    doc.text(`Data: ${new Date().toLocaleString("pt-BR")}`, 14, 48)

    const drawHistory = raffle.draws.filter((d) => !d.canceledAt).map((d) => [
      new Date(d.drawDate).toLocaleString("pt-BR"),
      String(d.drawnNumber).padStart(2, "0"),
      d.winnerName ?? "Desconhecido",
      d.isRedraw ? "Sim" : "Não",
    ])

    if (drawHistory.length > 0) {
      autoTable(doc, {
        startY: 56,
        head: [["Data", "Número", "Vencedor", "Refeito"]],
        body: drawHistory,
      })
    }

    doc.save(`sorteio-${raffle.title.replace(/\s+/g, "-").toLowerCase()}.pdf`)
    toast.success("PDF exportado!")
  }

  const exportExcel = () => {
    if (!raffle) return
    const wb = XLSX.utils.book_new()
    const wsData = [
      ["Resultado do Sorteio"],
      ["Rifa", raffle.title],
      ["Prêmio", raffle.prize],
      ["Data", new Date().toLocaleString("pt-BR")],
      [],
      ["Histórico de Sorteios"],
      ["Data", "Número", "Vencedor", "Refeito"],
    ]

    raffle.draws.filter((d) => !d.canceledAt).forEach((d) => {
      wsData.push([
        new Date(d.drawDate).toLocaleString("pt-BR"),
        String(d.drawnNumber).padStart(2, "0"),
        d.winnerName ?? "Desconhecido",
        d.isRedraw ? "Sim" : "Não",
      ])
    })

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    XLSX.utils.book_append_sheet(wb, ws, "Sorteio")
    XLSX.writeFile(wb, `sorteio-${raffle.title.replace(/\s+/g, "-").toLowerCase()}.xlsx`)
    toast.success("Excel exportado!")
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Erro ao carregar</h1>
        <Link href="/" className="text-purple-400 hover:text-purple-300">Voltar</Link>
      </div>
    )
  }

  if (!raffle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-zinc-800 rounded w-1/3" />
          <div className="h-64 bg-zinc-800 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href={`/raffle/${id}`} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <HiArrowLeft size={20} />
        Voltar
      </Link>

      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{raffle.title}</h1>
            <p className="text-zinc-400">{raffle.prize}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={exportPDF} className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-3 py-2 rounded-lg text-sm transition-colors">
              <HiDocumentText size={16} />
              PDF
            </button>
            <button onClick={exportExcel} className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-3 py-2 rounded-lg text-sm transition-colors">
              <HiTable size={16} />
              Excel
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-zinc-500">
          <span>{raffle._count.participants} participantes</span>
          <span>{raffle.maxNumbers - raffle.minNumbers + 1} números</span>
          <span>{raffle.draws.filter((d) => !d.canceledAt).length} sorteios</span>
        </div>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 mb-8">
        <DrawAnimation
          onComplete={handleDrawComplete}
          isDrawing={isDrawing}
          maxNumber={raffle.maxNumbers}
          minNumber={raffle.minNumbers}
        />
      </div>

      {isAdmin && !isDrawing && (
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={handleStartDraw}
            disabled={raffle._count.participants === 0 || raffle.status === "CANCELED"}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            <HiRefresh size={20} />
            Iniciar Sorteio
          </button>
          {raffle.status === "COMPLETED" && (
            <>
              <button onClick={() => setShowCancelModal(true)} className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-3 rounded-lg font-medium transition-colors">
                <HiBan size={20} />
                Cancelar Resultado
              </button>
              <button onClick={() => setShowRedrawModal(true)} className="flex items-center gap-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 px-4 py-3 rounded-lg font-medium transition-colors">
                <HiRefresh size={20} />
                Novo Sorteio
              </button>
            </>
          )}
        </div>
      )}

      {drawResult && (
        <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
            <HiCheck size={20} />
            Resultado do Sorteio
          </div>
          <div className="text-3xl font-bold text-white">
            Nº {String(drawResult.number).padStart(2, "0")} &mdash; {drawResult.winnerName}
          </div>
        </div>
      )}

      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Histórico de Sorteios</h2>
        {raffle.draws.length === 0 ? (
          <p className="text-zinc-500">Nenhum sorteio realizado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400">
                  <th className="text-left py-3 px-2">Data/Hora</th>
                  <th className="text-left py-3 px-2">Número</th>
                  <th className="text-left py-3 px-2">Vencedor</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Refeito</th>
                </tr>
              </thead>
              <tbody>
                {raffle.draws.map((draw) => (
                  <tr key={draw.id} className="border-b border-zinc-700/50 text-zinc-300">
                    <td className="py-3 px-2">{new Date(draw.drawDate).toLocaleString("pt-BR")}</td>
                    <td className="py-3 px-2 font-semibold">{String(draw.drawnNumber).padStart(2, "0")}</td>
                    <td className="py-3 px-2">{draw.winnerName ?? "Desconhecido"}</td>
                    <td className="py-3 px-2">
                      {draw.canceledAt ? (
                        <span className="text-red-400">Cancelado</span>
                      ) : (
                        <span className="text-green-400">Válido</span>
                      )}
                    </td>
                    <td className="py-3 px-2">{draw.isRedraw ? <span className="text-yellow-400">Sim</span> : "Não"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Cancelar Resultado</h3>
            <p className="text-zinc-400 text-sm mb-4">Informe o motivo do cancelamento do sorteio.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors resize-none mb-4"
              rows={3}
              placeholder="Motivo do cancelamento..."
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg transition-colors">
                Voltar
              </button>
              <button onClick={handleCancel} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors">
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {showRedrawModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Realizar Novo Sorteio</h3>
            <p className="text-zinc-400 text-sm mb-4">Informe o motivo do novo sorteio.</p>
            <textarea
              value={redrawReason}
              onChange={(e) => setRedrawReason(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors resize-none mb-4"
              rows={3}
              placeholder="Motivo do novo sorteio..."
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRedrawModal(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg transition-colors">
                Voltar
              </button>
              <button onClick={handleRedraw} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg transition-colors">
                Confirmar Novo Sorteio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
