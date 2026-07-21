"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { HiUpload } from "react-icons/hi"

interface RaffleFormData {
  title: string
  description: string
  prize: string
  prizeImage: string
  minNumbers: number
  maxNumbers: number
  drawDate: string
  allowMultipleWinners: boolean
  quantityWinners: number
}

interface RaffleFormProps {
  initialData?: RaffleFormData & { id?: string; status?: string }
  isEditing?: boolean
}

export function RaffleForm({ initialData, isEditing }: RaffleFormProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<RaffleFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    prize: initialData?.prize ?? "",
    prizeImage: initialData?.prizeImage ?? "",
    minNumbers: initialData?.minNumbers ?? 1,
    maxNumbers: initialData?.maxNumbers ?? 100,
    drawDate: initialData?.drawDate ? new Date(initialData.drawDate).toISOString().slice(0, 16) : "",
    allowMultipleWinners: initialData?.allowMultipleWinners ?? false,
    quantityWinners: initialData?.quantityWinners ?? 1,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RaffleFormData, string>>>({})

  const validate = () => {
    const newErrors: Partial<Record<keyof RaffleFormData, string>> = {}
    if (!formData.title.trim()) newErrors.title = "Título é obrigatório"
    if (!formData.prize.trim()) newErrors.prize = "Prêmio é obrigatório"
    if (formData.maxNumbers <= formData.minNumbers) newErrors.maxNumbers = "Número máximo deve ser maior que o mínimo"
    if (formData.drawDate && new Date(formData.drawDate) <= new Date()) newErrors.drawDate = "Data do sorteio deve ser futura"
    if (formData.allowMultipleWinners && formData.quantityWinners < 2) newErrors.quantityWinners = "Múltiplos vencedores requer pelo menos 2"
    if (formData.quantityWinners > (formData.maxNumbers - formData.minNumbers + 1)) newErrors.quantityWinners = "Quantidade excede o total de números"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      if (!res.ok) throw new Error("Upload falhou")
      const data = await res.json()
      setFormData((prev) => ({ ...prev, prizeImage: data.url }))
      toast.success("Imagem enviada com sucesso!")
    } catch {
      toast.error("Erro ao enviar imagem")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      const url = isEditing ? `/api/raffles/${initialData?.id}` : "/api/raffles"
      const method = isEditing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao salvar rifa")
      }

      toast.success(isEditing ? "Rifa atualizada!" : "Rifa criada!")
      router.push("/dashboard/raffles")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar rifa")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-zinc-300 text-sm font-medium mb-1">Título da Rifa *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
          placeholder="Ex: Rifa de um PlayStation 5"
        />
        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-zinc-300 text-sm font-medium mb-1">Descrição</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
          placeholder="Descreva sua rifa..."
        />
      </div>

      <div>
        <label className="block text-zinc-300 text-sm font-medium mb-1">Prêmio *</label>
        <input
          type="text"
          value={formData.prize}
          onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
          placeholder="Ex: PlayStation 5 Slim"
        />
        {errors.prize && <p className="text-red-400 text-xs mt-1">{errors.prize}</p>}
      </div>

      <div>
        <label className="block text-zinc-300 text-sm font-medium mb-1">Imagem do Prêmio</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-300 cursor-pointer hover:border-purple-500 transition-colors">
            <HiUpload size={18} />
            <span className="text-sm">{uploading ? "Enviando..." : "Escolher imagem"}</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
          </label>
          {formData.prizeImage && (
            <img src={formData.prizeImage} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-zinc-300 text-sm font-medium mb-1">Número Mínimo</label>
          <input
            type="number"
            value={formData.minNumbers}
            onChange={(e) => setFormData({ ...formData, minNumbers: parseInt(e.target.value) || 1 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-zinc-300 text-sm font-medium mb-1">Número Máximo</label>
          <input
            type="number"
            value={formData.maxNumbers}
            onChange={(e) => setFormData({ ...formData, maxNumbers: parseInt(e.target.value) || 100 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
          {errors.maxNumbers && <p className="text-red-400 text-xs mt-1">{errors.maxNumbers}</p>}
        </div>
      </div>

      <div>
        <label className="block text-zinc-300 text-sm font-medium mb-1">Data do Sorteio</label>
        <input
          type="datetime-local"
          value={formData.drawDate}
          onChange={(e) => setFormData({ ...formData, drawDate: e.target.value })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
        />
        {errors.drawDate && <p className="text-red-400 text-xs mt-1">{errors.drawDate}</p>}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="allowMultipleWinners"
          checked={formData.allowMultipleWinners}
          onChange={(e) => setFormData({ ...formData, allowMultipleWinners: e.target.checked })}
          className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-purple-600 focus:ring-purple-500"
        />
        <label htmlFor="allowMultipleWinners" className="text-zinc-300 text-sm">
          Permitir múltiplos vencedores
        </label>
      </div>

      {formData.allowMultipleWinners && (
        <div>
          <label className="block text-zinc-300 text-sm font-medium mb-1">Quantidade de Vencedores</label>
          <input
            type="number"
            value={formData.quantityWinners}
            onChange={(e) => setFormData({ ...formData, quantityWinners: parseInt(e.target.value) || 1 })}
            min={2}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
          {errors.quantityWinners && <p className="text-red-400 text-xs mt-1">{errors.quantityWinners}</p>}
        </div>
      )}

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
      >
        {isEditing ? "Atualizar Rifa" : "Criar Rifa"}
      </button>
    </form>
  )
}
