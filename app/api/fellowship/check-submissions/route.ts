import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { hasFellowshipExpired } from "@/lib/fellowship"

const prisma = new PrismaClient()

// This endpoint checks all users and auto-submits those who reached day 100
// Call this from a cron job or scheduled task
export async function POST(req: Request) {
  try {
    // Get all active users
    const users = await prisma.user.findMany({
      where: {
        fellowshipStatus: 'active'
      },
      include: {
        customerProofs: true
      }
    })

    const submissions = []

    for (const user of users) {
      // Check if fellowship period has ended
      if (hasFellowshipExpired(user.fellowshipStartDate)) {
        const customerCount = user.customerProofs.length
        const hasPassed = customerCount >= 10

        // Update user status to submitted
        await prisma.user.update({
          where: { id: user.id },
          data: {
            fellowshipStatus: 'submitted',
            submittedAt: new Date()
          }
        })

        submissions.push({
          userId: user.id,
          email: user.email,
          name: user.name,
          customerCount,
          hasPassed
        })

        console.log(`Auto-submitted fellowship for user ${user.email}: ${customerCount}/10 customers`)
      }
    }

    return NextResponse.json({
      message: `Processed ${submissions.length} auto-submissions`,
      submissions
    })

  } catch (error) {
    console.error("Error checking submissions:", error)
    return NextResponse.json(
      { error: "Failed to check submissions" },
      { status: 500 }
    )
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: "Fellowship auto-submission checker",
    instructions: "POST to this endpoint to check and submit expired fellowships"
  })
}
