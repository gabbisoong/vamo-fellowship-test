import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export interface EmailWithAttachmentOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

export async function sendEmailWithAttachment({
  to,
  subject,
  html,
  attachments
}: EmailWithAttachmentOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      attachments,
    });
    console.log('Email with attachment sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email with attachment:', error);
    return { success: false, error };
  }
}

export async function sendNoteUpdateEmail(
  subscriberEmail: string,
  noteTitle: string,
  noteContent: string,
  updateType: 'created' | 'updated'
) {
  const subject = `Note ${updateType === 'created' ? 'Created' : 'Updated'}: ${noteTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Note ${updateType === 'created' ? 'Created' : 'Updated'}</h2>
      <h3 style="color: #555;">${noteTitle}</h3>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="white-space: pre-wrap; color: #333;">${noteContent}</p>
      </div>
      <p style="color: #777; font-size: 12px;">
        This is an automated notification from Vamo Fellowship App.
      </p>
    </div>
  `;

  return sendEmail({
    to: subscriberEmail,
    subject,
    html,
  });
}

