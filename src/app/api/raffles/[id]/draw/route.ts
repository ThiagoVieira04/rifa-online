import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateMultipleWinners, validateNumberBelongsToRaffle } from "@/lib/draw"


export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const raffle = await prisma.raffle.findUnique({
      where: { id },
      include: { participants: true },
    })

    if (!raffle) {
      return NextResponse.json({ error: "Rifa não encontrada" }, { status: 404 })
    }

    if (raffle.creatorId !== session.id) {
      return NextResponse.json({ error: "Apenas o criador pode realizar o sorteio" }, { status: 403 })
    }

    if (raffle.status !== "ACTIVE") {
      return NextResponse.json({ error: "Rifa não está ativa para sorteio" }, { status: 400 })
    }

    if (raffle.participants.length === 0) {
      return NextResponse.json({ error: "Não há participantes para realizar o sorteio" }, { status: 400 })
    }

    const participants = raffle.participants as { number: number; participantName: string | null }[]
    const quantity = raffle.allowMultipleWinners ? raffle.quantityWinners : 1
    const takenNumbers = participants.map((p) => p.number)

    if (quantity > takenNumbers.length) {
      return NextResponse.json(
        { error: `Número de vencedores (${quantity}) excede o número de participantes (${takenNumbers.length})` },
        { status: 400 }
      )
    }

    const drawnNumbers = generateMultipleWinners(raffle.minNumbers, raffle.maxNumbers, quantity, [])

    const validNumbers = drawnNumbers.filter((n) =>
      validateNumberBelongsToRaffle(n, raffle.minNumbers, raffle.maxNumbers, participants)
    )

    if (validNumbers.length === 0) {
      return NextResponse.json({ error: "Nenhum número sorteado pertence a participantes" }, { status: 400 })
    }

    const drawRecords = []
    const winners: { number: number; winnerName: string }[] = []

    for (const num of validNumbers) {
      const participant = participants.find((p) => p.number === num)
      const winnerName = participant?.participantName ?? null

      const draw = await prisma.draw.create({
        data: {
          raffleId: id,
          drawnNumber: num,
          winnerName,
        },
      })

      drawRecords.push(draw)
      winners.push({ number: num, winnerName: winnerName ?? "Desconhecido" })
    }

    const firstWinner = drawRecords[0]
    await prisma.raffle.update({
      where: { id },
      data: {
        status: "COMPLETED",
        winnerNumber: firstWinner.drawnNumber,
        winnerName: firstWinner.winnerName,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "DRAW",
        details: `Sorteio realizado. Vencedores: ${winners.map((w) => `Nº ${w.number} - ${w.winnerName}`).join(", ")}`,
        userId: session.id,
        raffleId: id,
      },
    })

    return NextResponse.json({
      success: true,
      numbers: validNumbers,
      winners,
      draws: drawRecords,
    })
  } catch (error) {
    console.error("Erro ao realizar sorteio:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
