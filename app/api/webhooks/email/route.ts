import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { simpleParser } from "mailparser"
import { writeFile } from "fs/promises"
import path from "path"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    // Get the raw email data
    const formData = await req.formData()

    // Different email services send data differently
    // Mailgun sends 'body-mime' or individual parts
    // SendGrid sends 'email'

    const emailRaw = formData.get('email') || formData.get('body-mime')
    const fromEmail = formData.get('from') || formData.get('sender')

    if (!emailRaw) {
      console.error('No email data received')
      return NextResponse.json({ error: "No email data" }, { status: 400 })
    }

    // Parse the email
    let emailData: string
    if (emailRaw instanceof File) {
      emailData = await emailRaw.text()
    } else {
      emailData = emailRaw as string
    }

    const parsed = await simpleParser(emailData)

    // Extract sender email
    const senderEmail = parsed.from?.value[0]?.address || (fromEmail as string)

    if (!senderEmail) {
      console.error('No sender email found')
      return NextResponse.json({ error: "No sender email" }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: senderEmail.toLowerCase() }
    })

    if (!user) {
      console.log(`Email from unknown user: ${senderEmail}`)
      return NextResponse.json({
        message: "Email received but sender not registered"
      }, { status: 200 })
    }

    // Extract attachments (photos)
    const attachments = parsed.attachments || []
    const imageAttachments = attachments.filter(att =>
      att.contentType?.startsWith('image/')
    )

    if (imageAttachments.length === 0) {
      console.log('No image attachments found')
      return NextResponse.json({
        message: "No photos found in email"
      }, { status: 200 })
    }

    // Save each photo
    const savedPhotos = []
    for (const attachment of imageAttachments) {
      const filename = `${Date.now()}-${attachment.filename || 'photo.jpg'}`
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename)

      await writeFile(filepath, attachment.content)

      // Get caption from email subject or text
      const caption = parsed.subject || parsed.text?.substring(0, 200) || null

      const photo = await prisma.photo.create({
        data: {
          filename,
          url: `/uploads/${filename}`,
          caption,
          userId: user.id,
          source: "email",
        },
      })

      savedPhotos.push(photo)
    }

    console.log(`Saved ${savedPhotos.length} photos for user ${user.email}`)

    return NextResponse.json({
      message: `Successfully saved ${savedPhotos.length} photo(s)`,
      photos: savedPhotos
    })

  } catch (error) {
    console.error("Error processing email:", error)
    return NextResponse.json(
      { error: "Failed to process email" },
      { status: 500 }
    )
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: "Email webhook is ready",
    instructions: "Send POST requests with email data to this endpoint"
  })
}
