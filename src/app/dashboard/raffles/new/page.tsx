"use client"

import { useAuth } from "@/providers/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { RaffleForm } from "@/components/RaffleForm"
import { HiArrowLeft } from "react-icons/hi"
import Link from "next/link"

export default function NewRafflePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-1/3" />
          <div className="h-96 bg-zinc-800 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/dashboard/raffles" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <HiArrowLeft size={20} />
        Voltar
      </Link>

      <h1 className="text-3xl font-bold text-white mb-8">Nova Rifa</h1>

      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 sm:p-8">
        <RaffleForm />
      </div>
    </div>
  )
}
