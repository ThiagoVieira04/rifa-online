import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
    const status = searchParams.get("status")
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status && ["ACTIVE", "DRAWING", "COMPLETED", "CANCELED"].includes(status)) {
      where.status = status
    }

    const [raffles, total] = await Promise.all([
      prisma.raffle.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          creator: { select: { id: true, name: true, email: true, phone: true } },
          _count: { select: { participants: true } },
        },
      }),
      prisma.raffle.count({ where }),
    ])

    return NextResponse.json({
      raffles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao listar rifas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, prize, prizeImage, minNumbers, maxNumbers, drawDate, allowMultipleWinners, quantityWinners } = body

    if (!title || !prize) {
      return NextResponse.json({ error: "Título e prêmio são obrigatórios" }, { status: 400 })
    }

    if (minNumbers && maxNumbers && minNumbers >= maxNumbers) {
      return NextResponse.json({ error: "O número mínimo deve ser menor que o máximo" }, { status: 400 })
    }

    const raffle = await prisma.raffle.create({
      data: {
        title,
        description,
        prize,
        prizeImage,
        minNumbers: minNumbers ?? 1,
        maxNumbers: maxNumbers ?? 100,
        drawDate: drawDate ? new Date(drawDate) : null,
        allowMultipleWinners: allowMultipleWinners ?? false,
        quantityWinners: quantityWinners ?? 1,
        creatorId: session.id,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "CREATE_RAFFLE",
        details: `Rifa "${title}" criada`,
        userId: session.id,
        raffleId: raffle.id,
      },
    })

    return NextResponse.json(raffle, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar rifa:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
