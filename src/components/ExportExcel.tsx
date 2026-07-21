"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import { FiDownload } from "react-icons/fi"
import toast from "react-hot-toast"
import type { RaffleWithDetails } from "@/types"

interface ExportExcelProps {
  raffle: RaffleWithDetails
}

export default function ExportExcel({ raffle }: ExportExcelProps) {
  const [loading, setLoading] = useState(false)

  function handleExport() {
    setLoading(true)
    try {
      const data = raffle.participants.map((p) => ({
        Número: p.number,
        Nome: p.participantName,
        Telefone: p.participantPhone ?? "",
        Email: p.participantEmail ?? "",
        "Data de inscrição": new Date(p.createdAt).toLocaleString("pt-BR"),
      }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Participantes")

      ws["!cols"] = [
        { wch: 10 },
        { wch: 30 },
        { wch: 16 },
        { wch: 30 },
        { wch: 20 },
      ]

      XLSX.writeFile(wb, `rifa-${raffle.id}-participantes.xlsx`)
      toast.success("Excel exportado com sucesso!")
    } catch {
      toast.error("Erro ao exportar Excel.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
    >
      <FiDownload size={16} />
      {loading ? "Exportando..." : "Exportar Excel"}
    </button>
  )
}
