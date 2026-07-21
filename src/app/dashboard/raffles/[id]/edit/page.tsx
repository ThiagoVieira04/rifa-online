"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { useRouter, useParams } from "next/navigation"
import { RaffleForm } from "@/components/RaffleForm"
import { HiArrowLeft } from "react-icons/hi"
import Link from "next/link"
import toast from "react-hot-toast"

interface RaffleData {
  id: string
  title: string
  description: string | null
  prize: string
  prizeImage: string | null
  minNumbers: number
  maxNumbers: number
  drawDate: string | null
  status: string
  allowMultipleWinners: boolean
  quantityWinners: number
  creatorId: string
}

export default function EditRafflePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [raffle, setRaffle] = useState<RaffleData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    async function loadRaffle() {
      try {
        const res = await fetch(`/api/raffles/${id}`)
        if (!res.ok) throw new Error("Erro ao carregar")
        const data = await res.json()
        if (data.creatorId !== user?.id) {
          toast.error("Você não tem permissão para editar esta rifa")
          router.push("/dashboard/raffles")
          return
        }
        if (data.status !== "ACTIVE") {
          toast.error("Apenas rifas ativas podem ser editadas")
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
    }
    if (user?.id) {
      loadRaffle()
    }
  }, [id, user, router])

  if (loading || dataLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-1/3" />
          <div className="h-96 bg-zinc-800 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!user || !raffle) return null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/dashboard/raffles" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <HiArrowLeft size={20} />
        Voltar
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Editar Rifa</h1>

      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 sm:p-8">
        <RaffleForm
          initialData={{
            id: raffle.id,
            title: raffle.title,
            description: raffle.description ?? "",
            prize: raffle.prize,
            prizeImage: raffle.prizeImage ?? "",
            minNumbers: raffle.minNumbers,
            maxNumbers: raffle.maxNumbers,
            drawDate: raffle.drawDate ?? "",
            allowMultipleWinners: raffle.allowMultipleWinners,
            quantityWinners: raffle.quantityWinners,
            status: raffle.status,
          }}
          isEditing
        />
      </div>
    </div>
  )
}
