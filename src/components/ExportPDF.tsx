"use client"

import { useState } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { FiFileText } from "react-icons/fi"
import toast from "react-hot-toast"
import type { RaffleWithDetails } from "@/types"

interface ExportPDFProps {
  raffle: RaffleWithDetails
}

export default function ExportPDF({ raffle }: ExportPDFProps) {
  const [loading, setLoading] = useState(false)

  function handleExport() {
    setLoading(true)
    try {
      const doc = new jsPDF()

      doc.setFontSize(18)
      doc.text(raffle.title, 14, 22)

      doc.setFontSize(11)
      doc.text(`Data do sorteio: ${raffle.drawDate ? new Date(raffle.drawDate).toLocaleDateString("pt-BR") : "N/A"}`, 14, 32)
      doc.text(`Prêmio: ${raffle.prize}`, 14, 39)

      if (raffle.winnerName) {
        doc.text(`Vencedor(a): ${raffle.winnerName}`, 14, 46)
      }
      if (raffle.winnerNumber !== null) {
        doc.text(`Número sorteado: ${raffle.winnerNumber}`, 14, 53)
      }

      const tableData = raffle.participants.map((p, i) => [
        i + 1,
        p.number,
        p.participantName,
        p.participantPhone ?? "-",
        p.participantEmail ?? "-",
      ])

      autoTable(doc, {
        startY: 62,
        head: [["#", "Número", "Nome", "Telefone", "E-mail"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [147, 51, 234] },
        styles: { fontSize: 9 },
      })

      const participants = raffle.participants
      const total = raffle.maxNumbers - raffle.minNumbers + 1
      const pct = total > 0 ? Math.round((participants.length / total) * 100) : 0

      const finalY = (doc as any).lastAutoTable.finalY ?? 62
      doc.setFontSize(10)
      doc.text(`Total de participantes: ${participants.length} de ${total} (${pct}%)`, 14, finalY + 10)

      doc.save(`rifa-${raffle.id}.pdf`)
      toast.success("PDF exportado com sucesso!")
    } catch {
      toast.error("Erro ao exportar PDF.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
    >
      <FiFileText size={16} />
      {loading ? "Exportando..." : "Exportar PDF"}
    </button>
  )
}
