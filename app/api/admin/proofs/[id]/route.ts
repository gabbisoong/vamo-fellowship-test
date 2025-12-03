import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Verify/unverify a customer proof
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { verified } = await req.json()

    const proof = await prisma.customerProof.update({
      where: { id: params.id },
      data: {
        verified,
        verifiedBy: verified ? session.user.id : null,
        verifiedAt: verified ? new Date() : null
      }
    })

    return NextResponse.json(proof)
  } catch (error) {
    console.error("Error verifying proof:", error)
    return NextResponse.json(
      { error: "Failed to verify proof" },
      { status: 500 }
    )
  }
}
