import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sendEmailWithAttachment } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const attachment = formData.get('attachment') as File | null;

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    // Prepare attachments array
    const attachments = [];
    if (attachment) {
      const buffer = Buffer.from(await attachment.arrayBuffer());
      attachments.push({
        filename: attachment.name,
        content: buffer,
        contentType: attachment.type,
      });
    }

    // Build email HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Social Proof Submission</h2>
        <p><strong>From:</strong> ${session.user.name || session.user.email}</p>
        <p><strong>Email:</strong> ${session.user.email}</p>
        ${message ? `
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="white-space: pre-wrap; color: #333;">${message}</p>
          </div>
        ` : ''}
        ${attachment ? `<p><strong>Attachment:</strong> ${attachment.name}</p>` : ''}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #777; font-size: 12px;">
          Submitted via Vamo Fellowship App
        </p>
      </div>
    `;

    // Send email to attachments@vamotalent.com
    const result = await sendEmailWithAttachment({
      to: 'attachments@vamotalent.com',
      subject: `[Fellowship] ${subject}`,
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Error in send-attachment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
