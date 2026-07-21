import Link from "next/link"
import { HiTicket, HiShieldCheck, HiChartBar, HiEmojiHappy } from "react-icons/hi"
import { RaffleCard } from "@/components/RaffleCard"

interface RaffleData {
  id: string
  title: string
  prize: string
  prizeImage: string | null
  status: string
  drawDate: string | null
  minNumbers: number
  maxNumbers: number
  creator: { id: string; name: string | null; email: string | null; image: string | null }
  _count: { participants: number }
}

const features = [
  { icon: HiTicket, title: "100% Gratuito", desc: "Sem taxas, sem planos, sem limites. Tudo de graça para sempre." },
  { icon: HiShieldCheck, title: "Sorteio Justo", desc: "Algoritmo seguro e aleatório para garantir a imparcialidade." },
  { icon: HiChartBar, title: "Resultados Transparentes", desc: "Todos os sorteios são registrados e auditáveis." },
  { icon: HiEmojiHappy, title: "Fácil de Usar", desc: "Interface simples e intuitiva. Crie sua rifa em segundos." },
]

async function getRaffles() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/api/raffles?limit=12`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.raffles ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  let raffles: RaffleData[] = []
  try {
    raffles = await getRaffles()
  } catch {}

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-zinc-900 to-blue-900/30" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-7xl font-bold mb-6">
              <span className="text-gradient">RifaOnline</span>
            </h1>
            <p className="text-xl sm:text-2xl text-zinc-400 mb-10">
              A plataforma gratuita de rifas e sorteios online
            </p>
            <Link
              href="/dashboard/raffles/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
            >
              <HiTicket size={24} />
              Criar Rifa Agora
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Por que escolher a RifaOnline?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300">
              <feature.icon className="text-purple-400 mb-4" size={32} />
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-zinc-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Rifas Recentes</h2>
          {raffles.length > 0 && (
            <Link href="/dashboard/raffles" className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
              Ver todas
            </Link>
          )}
        </div>
        {raffles.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-zinc-800/50 border border-zinc-700 rounded-xl h-52 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((r) => (
              <RaffleCard
                key={r.id}
                id={r.id}
                title={r.title}
                prize={r.prize}
                prizeImage={r.prizeImage}
                status={r.status}
                participantCount={r._count.participants}
                maxNumbers={r.maxNumbers}
                drawDate={r.drawDate}
                creatorName={r.creator?.name}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
