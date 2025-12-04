// Business logic - Email handler + API endpoints
import PostalMime from 'postal-mime';
import { getDashboardHTML } from './dashboard';

interface Env {
  ATTACHMENTS: R2Bucket;
}

interface EmailMessage {
  from: string;
  to: string;
  headers: Headers;
  raw: ReadableStream;
  rawSize: number;
}

export default {
  // Email handler - receives incoming emails and stores attachments
  async email(message: EmailMessage, env: Env, _ctx: ExecutionContext): Promise<void> {
    console.log(`Received email from ${message.from} to ${message.to}`);

    const rawEmail = await new Response(message.raw).arrayBuffer();
    const email = await PostalMime.parse(rawEmail);

    console.log(`Subject: ${email.subject}`);
    console.log(`Attachments: ${email.attachments.length}`);

    for (const attachment of email.attachments) {
      if (!attachment.filename) continue;

      const timestamp = Date.now();
      const key = `${timestamp}-${attachment.filename}`;

      await env.ATTACHMENTS.put(key, attachment.content, {
        customMetadata: {
          filename: attachment.filename,
          mimeType: attachment.mimeType || 'application/octet-stream',
          from: message.from,
          subject: email.subject || '(no subject)',
          receivedAt: new Date().toISOString(),
        },
      });

      console.log(`Stored attachment: ${key}`);
    }
  },

  // HTTP handler - API endpoints + dashboard
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // API: List all attachments
    if (url.pathname === '/api/attachments') {
      const listed = await env.ATTACHMENTS.list();
      const attachments = await Promise.all(
        listed.objects.map(async (obj) => {
          const object = await env.ATTACHMENTS.head(obj.key);
          return {
            key: obj.key,
            size: obj.size,
            uploaded: obj.uploaded.toISOString(),
            filename: object?.customMetadata?.filename || obj.key,
            mimeType: object?.customMetadata?.mimeType || 'application/octet-stream',
            from: object?.customMetadata?.from || 'unknown',
            subject: object?.customMetadata?.subject || '',
          };
        })
      );

      // Sort by newest first
      attachments.sort((a, b) => new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime());

      return new Response(JSON.stringify(attachments), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // API: Get specific file
    if (url.pathname.startsWith('/api/file/')) {
      const key = decodeURIComponent(url.pathname.replace('/api/file/', ''));
      const object = await env.ATTACHMENTS.get(key);

      if (!object) {
        return new Response('Not found', { status: 404 });
      }

      const headers = new Headers();
      headers.set('Content-Type', object.customMetadata?.mimeType || 'application/octet-stream');

      // If download param is present, force download
      if (url.searchParams.has('download')) {
        headers.set('Content-Disposition', `attachment; filename="${object.customMetadata?.filename || key}"`);
      }

      return new Response(object.body, { headers });
    }

    // API: Delete file
    if (url.pathname.startsWith('/api/delete/') && request.method === 'DELETE') {
      const key = decodeURIComponent(url.pathname.replace('/api/delete/', ''));
      await env.ATTACHMENTS.delete(key);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Serve dashboard (frontend from dashboard.ts)
    return new Response(getDashboardHTML(), {
      headers: { 'Content-Type': 'text/html' },
    });
  },
};
