import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNoteUpdateEmail } from '@/lib/email';

// GET /api/notes - Get all notes
export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        subscribers: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, authorEmail, authorName, subscriberEmails = [] } = body;

    if (!title || !content || !authorEmail) {
      return NextResponse.json(
        { error: 'Title, content, and author email are required' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: authorEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: authorEmail,
          name: authorName || null,
        },
      });
    } else if (authorName && user.name !== authorName) {
      // Update name if provided and different
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: authorName },
      });
    }

    // Create note
    const note = await prisma.note.create({
      data: {
        title,
        content,
        authorId: user.id,
        subscribers: {
          create: subscriberEmails.map((email: string) => ({
            email: email.trim(),
          })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        subscribers: true,
      },
    });

    // Send email notifications to subscribers
    if (subscriberEmails.length > 0) {
      const emailPromises = subscriberEmails.map((email: string) =>
        sendNoteUpdateEmail(email.trim(), title, content, 'created').catch(
          (err) => {
            console.error(`Failed to send email to ${email}:`, err);
            return { success: false, email };
          }
        )
      );
      await Promise.allSettled(emailPromises);
    }

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

