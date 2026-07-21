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
      return NextResponse.json({ error: "Apenas o criador pode publicar o resultado" }, { status: 403 })
    }

    if (raffle.status !== "COMPLETED") {
      return NextResponse.json({ error: "Rifa precisa estar concluída para publicar" }, { status: 400 })
    }

    const draws = await prisma.draw.findMany({
      where: { raffleId: id, canceledAt: null },
      orderBy: { createdAt: "desc" },
    })

    if (draws.length === 0) {
      return NextResponse.json({ error: "Nenhum sorteio válido encontrado para publicar" }, { status: 400 })
    }

    await prisma.auditLog.create({
      data: {
        action: "PUBLISH_RESULT",
        details: `Resultado da rifa "${raffle.title}" publicado`,
        userId: session.id,
        raffleId: id,
      },
    })

    return NextResponse.json({ message: "Resultado publicado com sucesso", published: true })
  } catch (error) {
    console.error("Erro ao publicar resultado:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
