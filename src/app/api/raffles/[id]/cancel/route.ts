import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const raffle = await prisma.raffle.findUnique({ where: { id } })
    if (!raffle) {
      return NextResponse.json({ error: "Rifa não encontrada" }, { status: 404 })
    }

    if (raffle.creatorId !== session.id) {
      return NextResponse.json({ error: "Apenas o criador pode cancelar o resultado" }, { status: 403 })
    }

    if (raffle.status !== "COMPLETED") {
      return NextResponse.json({ error: "Rifa não está concluída" }, { status: 400 })
    }

    const body = await request.json()
    const { reason } = body

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json({ error: "Motivo do cancelamento é obrigatório" }, { status: 400 })
    }

    await prisma.draw.updateMany({
      where: { raffleId: id, canceledAt: null },
      data: { canceledAt: new Date(), reason: reason.trim() },
    })

    await prisma.raffle.update({
      where: { id },
      data: { status: "ACTIVE", winnerNumber: null, winnerName: null },
    })

    await prisma.auditLog.create({
      data: {
        action: "CANCEL_DRAW",
        details: `Resultado cancelado. Motivo: ${reason.trim()}`,
        userId: session.id,
        raffleId: id,
      },
    })

    return NextResponse.json({ message: "Resultado cancelado com sucesso" })
  } catch (error) {
    console.error("Erro ao cancelar resultado:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
