import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { getFellowshipStatus } from "@/lib/fellowship"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        customerProofs: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const fellowshipStatus = getFellowshipStatus(
      user.fellowshipStartDate,
      user.customerProofs.length,
      user.fellowshipStatus
    )

    // Calculate end date (100 days from start)
    const startDate = user.fellowshipStartDate
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 100)

    return NextResponse.json({
      ...fellowshipStatus,
      customerProofsCount: user.customerProofs.length,
      fellowshipStatus: user.fellowshipStatus,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    })
  } catch (error) {
    console.error("Error fetching fellowship status:", error)
    return NextResponse.json(
      { error: "Failed to fetch fellowship status" },
      { status: 500 }
    )
  }
}
