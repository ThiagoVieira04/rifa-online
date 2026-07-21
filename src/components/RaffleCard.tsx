import Link from "next/link"
import { HiUserGroup, HiTicket, HiCalendar } from "react-icons/hi"

interface RaffleCardProps {
  id: string
  title: string
  prize: string
  prizeImage: string | null
  status: string
  participantCount: number
  maxNumbers: number
  drawDate: string | null
  creatorName: string | null
}

export function RaffleCard({ id, title, prize, prizeImage, status, participantCount, maxNumbers, drawDate, creatorName }: RaffleCardProps) {
  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-500/10 text-green-400",
    DRAWING: "bg-yellow-500/10 text-yellow-400",
    COMPLETED: "bg-blue-500/10 text-blue-400",
    CANCELED: "bg-red-500/10 text-red-400",
  }

  const statusLabels: Record<string, string> = {
    ACTIVE: "Ativa",
    DRAWING: "Sorteando",
    COMPLETED: "Concluída",
    CANCELED: "Cancelada",
  }

  return (
    <Link href={`/raffle/${id}`} className="block group">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
        {prizeImage && (
          <div className="h-40 overflow-hidden">
            <img src={prizeImage} alt={prize} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-white font-semibold text-lg group-hover:text-purple-400 transition-colors line-clamp-1">{title}</h3>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[status] ?? "bg-zinc-500/10 text-zinc-400"}`}>
              {statusLabels[status] ?? status}
            </span>
          </div>
          <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{prize}</p>
          <div className="flex items-center gap-4 text-zinc-500 text-xs">
            <span className="flex items-center gap-1">
              <HiUserGroup size={14} />
              {participantCount} participantes
            </span>
            <span className="flex items-center gap-1">
              <HiTicket size={14} />
              {maxNumbers} números
            </span>
            {drawDate && (
              <span className="flex items-center gap-1">
                <HiCalendar size={14} />
                {new Date(drawDate).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
          {creatorName && (
            <p className="text-zinc-600 text-xs mt-2">Criado por {creatorName}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
