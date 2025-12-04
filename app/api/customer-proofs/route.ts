import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { writeFile } from "fs/promises"
import path from "path"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const proofs = await prisma.customerProof.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(proofs)
  } catch (error) {
    console.error("Error fetching customer proofs:", error)
    return NextResponse.json(
      { error: "Failed to fetch customer proofs" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("document") as File
    const customerName = formData.get("customerName") as string
    const paymentDate = formData.get("paymentDate") as string
    const amount = formData.get("amount") as string

    if (!file || !customerName || !paymentDate || !amount) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate file type (images and PDFs only)
    const fileType = file.type
    if (!fileType.startsWith('image/') && fileType !== 'application/pdf') {
      return NextResponse.json(
        { error: "Only images and PDFs are allowed" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'proofs', filename)

    // Create proofs directory if it doesn't exist
    const proofsDir = path.join(process.cwd(), 'public', 'uploads', 'proofs')
    const fs = require('fs')
    if (!fs.existsSync(proofsDir)) {
      fs.mkdirSync(proofsDir, { recursive: true })
    }

    await writeFile(filepath, buffer)

    const proof = await prisma.customerProof.create({
      data: {
        customerName,
        paymentDate: new Date(paymentDate),
        amount: parseFloat(amount),
        documentUrl: `/uploads/proofs/${filename}`,
        documentName: file.name,
        userId: session.user.id,
      },
    })

    return NextResponse.json(proof, { status: 201 })
  } catch (error) {
    console.error("Error uploading customer proof:", error)
    return NextResponse.json(
      { error: "Failed to upload customer proof" },
      { status: 500 }
    )
  }
}
