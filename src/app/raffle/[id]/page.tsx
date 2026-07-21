import Link from "next/link"
import { HiCalendar, HiUserGroup, HiTicket, HiShare, HiPlay, HiStar, HiClock } from "react-icons/hi"
import { NumberSelector } from "@/components/NumberSelector"

interface RaffleDetail {
  id: string
  title: string
  description: string | null
  prize: string
  prizeImage: string | null
  minNumbers: number
  maxNumbers: number
  drawDate: string | null
  status: "ACTIVE" | "DRAWING" | "COMPLETED" | "CANCELED"
  winnerNumber: number | null
  winnerName: string | null
  allowMultipleWinners: boolean
  quantityWinners: number
  createdAt: string
  creator: { id: string; name: string | null; email: string | null; image: string | null }
  participants: { id: string; number: number; participantName: string; participantPhone: string | null; participantEmail: string | null; createdAt: string }[]
  draws: { id: string; drawDate: string; drawnNumber: number; winnerName: string | null; reason: string | null; isRedraw: boolean; canceledAt: string | null; createdAt: string }[]
  _count: { participants: number }
}

async function getRaffle(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/raffles/${id}`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json() as Promise<RaffleDetail>
}

function Countdown({ drawDate }: { drawDate: string }) {
  const target = new Date(drawDate).getTime()
  const now = Date.now()
  const diff = Math.max(0, target - now)

  if (diff === 0) return <span className="text-green-400">Data do sorteio já chegou!</span>

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <span>
      {days > 0 && `${days}d `}{hours}h {minutes}min
    </span>
  )
}

export default async function RaffleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const raffle = await getRaffle(id)

  if (!raffle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4 text-zinc-700">?</div>
        <h1 className="text-2xl font-bold text-white mb-2">Rifa não encontrada</h1>
        <p className="text-zinc-400 mb-6">Esta rifa não existe ou foi removida.</p>
        <Link href="/" className="text-purple-400 hover:text-purple-300">Voltar ao início</Link>
      </div>
    )
  }

  const statusLabels: Record<string, string> = {
    ACTIVE: "Ativa",
    DRAWING: "Sorteando",
    COMPLETED: "Concluída",
    CANCELED: "Cancelada",
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-500/10 text-green-400",
    DRAWING: "bg-yellow-500/10 text-yellow-400",
    COMPLETED: "bg-blue-500/10 text-blue-400",
    CANCELED: "bg-red-500/10 text-red-400",
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
        {raffle.prizeImage && (
          <div className="h-64 sm:h-80 overflow-hidden">
            <img src={raffle.prizeImage} alt={raffle.prize} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{raffle.title}</h1>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[raffle.status]}`}>
                  {statusLabels[raffle.status]}
                </span>
              </div>
              <p className="text-zinc-400 text-lg">{raffle.prize}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                alert("Link copiado!")
              }}
              className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <HiShare size={16} />
              Compartilhar
            </button>
          </div>

          {raffle.description && (
            <p className="text-zinc-400 mb-6 leading-relaxed">{raffle.description}</p>
          )}

          <div className="flex flex-wrap gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2 text-zinc-400">
              <HiUserGroup size={18} className="text-purple-400" />
              <span><strong className="text-white">{raffle._count.participants}</strong> participantes</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <HiTicket size={18} className="text-purple-400" />
              <span><strong className="text-white">{raffle.maxNumbers - raffle.minNumbers + 1}</strong> números</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <HiCalendar size={18} className="text-purple-400" />
              <span>
                {raffle.drawDate
                  ? new Date(raffle.drawDate).toLocaleDateString("pt-BR", { dateStyle: "long", timeStyle: "short" })
                  : "Sem data definida"}
              </span>
            </div>
            {raffle.drawDate && raffle.status === "ACTIVE" && (
              <div className="flex items-center gap-2 text-zinc-400">
                <HiClock size={18} className="text-yellow-400" />
                <span><Countdown drawDate={raffle.drawDate} /></span>
              </div>
            )}
          </div>

          {raffle.status === "COMPLETED" && (
            <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <HiStar className="text-yellow-400" size={28} />
                <h2 className="text-xl font-bold text-white">Resultado do Sorteio</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-zinc-500 text-sm mb-1">Número Sorteado</p>
                  <p className="text-3xl font-bold text-yellow-400">{String(raffle.winnerNumber ?? "").padStart(2, "0")}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm mb-1">Vencedor</p>
                  <p className="text-lg font-medium text-white">{raffle.winnerName ?? "Desconhecido"}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm mb-1">Histórico de Sorteios</p>
                  <div className="space-y-1">
                    {raffle.draws.filter((d) => !d.canceledAt).map((draw) => (
                      <p key={draw.id} className="text-zinc-300 text-sm">
                        Nº {String(draw.drawnNumber).padStart(2, "0")} &mdash; {new Date(draw.drawDate).toLocaleString("pt-BR")}
                        {draw.isRedraw && <span className="text-yellow-400 ml-1">(refeito)</span>}
                      </p>
                    ))}
                    {raffle.draws.filter((d) => d.canceledAt).length > 0 && (
                      <div className="mt-2">
                        <p className="text-red-400 text-xs">Sorteios cancelados: {raffle.draws.filter((d) => d.canceledAt).length}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              {raffle.status === "COMPLETED" ? "Números" : "Números Disponíveis"}
            </h3>
            <NumberSelector
              minNumbers={raffle.minNumbers}
              maxNumbers={raffle.maxNumbers}
              participants={raffle.participants.map((p) => ({
                number: p.number,
                participantName: p.participantName,
                participantPhone: p.participantPhone,
                participantEmail: p.participantEmail,
              }))}
              winnerNumber={raffle.winnerNumber}
              status={raffle.status}
            />
          </div>

          {raffle.status !== "CANCELED" && (
            <div className="flex gap-4">
              <Link
                href={`/raffle/${raffle.id}/draw`}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                <HiPlay size={20} />
                Ver Sorteio
              </Link>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-zinc-700 flex items-center gap-3 text-sm text-zinc-500">
            {raffle.creator.image && <img src={raffle.creator.image} alt="" className="w-8 h-8 rounded-full" />}
            <span>Criado por {raffle.creator.name ?? raffle.creator.email ?? "Usuário"}</span>
            <span>&bull;</span>
            <span>{new Date(raffle.createdAt).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
