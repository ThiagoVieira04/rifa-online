import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const raffle = await prisma.raffle.findUnique({
      where: { id },
      select: { id: true, creatorId: true },
    })

    if (!raffle) {
      return NextResponse.json({ error: "Rifa não encontrada" }, { status: 404 })
    }

    const participants = await prisma.raffleParticipant.findMany({
      where: { raffleId: id },
      orderBy: { number: "asc" },
    })

    return NextResponse.json(participants)
  } catch (error) {
    console.error("Erro ao listar participantes:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const raffle = await prisma.raffle.findUnique({ where: { id } })
    if (!raffle) {
      return NextResponse.json({ error: "Rifa não encontrada" }, { status: 404 })
    }

    if (raffle.status !== "ACTIVE") {
      return NextResponse.json({ error: "Rifa não está aceitando participantes" }, { status: 400 })
    }

    const body = await request.json()
    const { number, participantName, participantPhone, participantEmail } = body

    if (!number || !participantName) {
      return NextResponse.json({ error: "Número e nome são obrigatórios" }, { status: 400 })
    }

    const num = parseInt(number, 10)

    if (isNaN(num) || num < raffle.minNumbers || num > raffle.maxNumbers) {
      return NextResponse.json(
        { error: `Número deve estar entre ${raffle.minNumbers} e ${raffle.maxNumbers}` },
        { status: 400 }
      )
    }

    const existing = await prisma.raffleParticipant.findUnique({
      where: { raffleId_number: { raffleId: id, number: num } },
    })

    if (existing) {
      return NextResponse.json({ error: "Este número já foi escolhido" }, { status: 409 })
    }

    const participant = await prisma.raffleParticipant.create({
      data: {
        raffleId: id,
        number: num,
        participantName,
        participantPhone: participantPhone ?? null,
        participantEmail: participantEmail ?? null,
      },
    })

    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    console.error("Erro ao adicionar participante:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
