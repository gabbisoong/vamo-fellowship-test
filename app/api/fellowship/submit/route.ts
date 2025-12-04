import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Allow users to manually submit before day 100 if they have 10 customers
export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        customerProofs: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.fellowshipStatus !== 'active') {
      return NextResponse.json(
        { error: "Fellowship already submitted" },
        { status: 400 }
      )
    }

    const customerCount = user.customerProofs.length

    if (customerCount < 10) {
      return NextResponse.json(
        { error: `You need 10 customers to submit. You have ${customerCount}.` },
        { status: 400 }
      )
    }

    // Update status to submitted
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fellowshipStatus: 'submitted',
        submittedAt: new Date()
      }
    })

    return NextResponse.json({
      message: "Fellowship submitted successfully!",
      customerCount
    })

  } catch (error) {
    console.error("Error submitting fellowship:", error)
    return NextResponse.json(
      { error: "Failed to submit fellowship" },
      { status: 500 }
    )
  }
}
