import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// TODO: Add admin authentication check
// For now, any logged-in user can access
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all submitted, approved, and rejected fellowships
    const users = await prisma.user.findMany({
      where: {
        fellowshipStatus: {
          in: ['submitted', 'approved', 'rejected']
        }
      },
      include: {
        customerProofs: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    )
  }
}
