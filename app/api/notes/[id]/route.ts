import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNoteUpdateEmail } from '@/lib/email';

// GET /api/notes/[id] - Get a single note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: params.id },
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

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update a note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, content, subscriberEmails } = body;

    // Get existing note to check for changes
    const existingNote = await prisma.note.findUnique({
      where: { id: params.id },
      include: {
        subscribers: true,
      },
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Update note
    const updatedNote = await prisma.note.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
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

    // Handle subscriber updates
    if (subscriberEmails !== undefined) {
      const newSubscriberEmails = subscriberEmails.map((email: string) =>
        email.trim()
      );
      const existingSubscriberEmails = existingNote.subscribers.map(
        (s) => s.email
      );

      // Find emails to add
      const emailsToAdd = newSubscriberEmails.filter(
        (email: string) => !existingSubscriberEmails.includes(email)
      );

      // Find emails to remove
      const emailsToRemove = existingSubscriberEmails.filter(
        (email: string) => !newSubscriberEmails.includes(email)
      );

      // Add new subscribers
      if (emailsToAdd.length > 0) {
        await prisma.noteSubscriber.createMany({
          data: emailsToAdd.map((email: string) => ({
            noteId: params.id,
            email,
          })),
          skipDuplicates: true,
        });
      }

      // Remove old subscribers
      if (emailsToRemove.length > 0) {
        await prisma.noteSubscriber.deleteMany({
          where: {
            noteId: params.id,
            email: { in: emailsToRemove },
          },
        });
      }

      // Refresh note with updated subscribers
      const noteWithSubscribers = await prisma.note.findUnique({
        where: { id: params.id },
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

      // Send email notifications to all current subscribers
      if (noteWithSubscribers && noteWithSubscribers.subscribers.length > 0) {
        const emailPromises = noteWithSubscribers.subscribers.map((subscriber) =>
          sendNoteUpdateEmail(
            subscriber.email,
            updatedNote.title,
            updatedNote.content,
            'updated'
          ).catch((err) => {
            console.error(
              `Failed to send email to ${subscriber.email}:`,
              err
            );
            return { success: false, email: subscriber.email };
          })
        );
        await Promise.allSettled(emailPromises);
      }

      return NextResponse.json(noteWithSubscribers);
    } else {
      // If note content changed, notify existing subscribers
      const contentChanged =
        (title && title !== existingNote.title) ||
        (content && content !== existingNote.content);

      if (contentChanged && existingNote.subscribers.length > 0) {
        const emailPromises = existingNote.subscribers.map((subscriber) =>
          sendNoteUpdateEmail(
            subscriber.email,
            updatedNote.title,
            updatedNote.content,
            'updated'
          ).catch((err) => {
            console.error(
              `Failed to send email to ${subscriber.email}:`,
              err
            );
            return { success: false, email: subscriber.email };
          })
        );
        await Promise.allSettled(emailPromises);
      }

      return NextResponse.json(updatedNote);
    }
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: params.id },
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    await prisma.note.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}

