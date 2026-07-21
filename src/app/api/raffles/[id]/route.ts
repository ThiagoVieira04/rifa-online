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
      include: {
        creator: { select: { id: true, name: true, email: true, phone: true } },
        participants: { orderBy: { number: "asc" } },
        draws: { orderBy: { createdAt: "desc" } },
        _count: { select: { participants: true } },
      },
    })

    if (!raffle) {
      return NextResponse.json({ error: "Rifa não encontrada" }, { status: 404 })
    }

    return NextResponse.json(raffle)
  } catch (error) {
    console.error("Erro ao buscar rifa:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.raffle.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Rifa não encontrada" }, { status: 404 })
    }

    if (existing.creatorId !== session.id) {
      return NextResponse.json({ error: "Apenas o criador pode editar esta rifa" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, prize, prizeImage, minNumbers, maxNumbers, drawDate, allowMultipleWinners, quantityWinners } = body

    const updated = await prisma.raffle.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(prize !== undefined && { prize }),
        ...(prizeImage !== undefined && { prizeImage }),
        ...(minNumbers !== undefined && { minNumbers }),
        ...(maxNumbers !== undefined && { maxNumbers }),
        ...(drawDate !== undefined && { drawDate: drawDate ? new Date(drawDate) : null }),
        ...(allowMultipleWinners !== undefined && { allowMultipleWinners }),
        ...(quantityWinners !== undefined && { quantityWinners }),
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_RAFFLE",
        details: `Rifa "${updated.title}" atualizada`,
        userId: session.id,
        raffleId: id,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erro ao atualizar rifa:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.raffle.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Rifa não encontrada" }, { status: 404 })
    }

    if (existing.creatorId !== session.id) {
      return NextResponse.json({ error: "Apenas o criador pode excluir esta rifa" }, { status: 403 })
    }

    await prisma.raffle.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        action: "DELETE_RAFFLE",
        details: `Rifa "${existing.title}" excluída`,
        userId: session.id,
      },
    })

    return NextResponse.json({ message: "Rifa excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir rifa:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
