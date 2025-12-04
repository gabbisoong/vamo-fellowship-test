// Dashboard UI - Designer can edit this file independently

export function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Attachments Dashboard</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: #333;
      margin-bottom: 20px;
    }

    .info {
      background: #e3f2fd;
      border: 1px solid #90caf9;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .info code {
      background: #fff;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }

    .attachments {
      display: grid;
      gap: 15px;
    }

    .attachment {
      background: white;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .attachment:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .preview {
      width: 60px;
      height: 60px;
      border-radius: 6px;
      object-fit: cover;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
    }

    .details {
      flex: 1;
      min-width: 0;
    }

    .filename {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      word-break: break-word;
    }

    .meta {
      font-size: 12px;
      color: #666;
    }

    .meta span {
      margin-right: 15px;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      text-decoration: none;
    }

    .btn-view {
      background: #2196f3;
      color: white;
    }

    .btn-download {
      background: #4caf50;
      color: white;
    }

    .btn-delete {
      background: #f44336;
      color: white;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .empty {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .refresh-btn {
      background: #fff;
      border: 1px solid #ddd;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 15px;
    }

    .refresh-btn:hover {
      background: #f5f5f5;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Email Attachments Dashboard</h1>

    <div class="info">
      Send emails with attachments to your configured email address to see them here.
    </div>

    <button class="refresh-btn" onclick="loadAttachments()">Refresh</button>

    <div id="attachments" class="attachments">
      <div class="loading">Loading attachments...</div>
    </div>
  </div>

  <script>
    // API client - these endpoints are defined in index.ts
    const API = {
      listAttachments: () => fetch('/api/attachments').then(r => r.json()),
      getFileUrl: (key) => \`/api/file/\${encodeURIComponent(key)}\`,
      deleteFile: (key) => fetch(\`/api/delete/\${encodeURIComponent(key)}\`, { method: 'DELETE' })
    };

    async function loadAttachments() {
      const container = document.getElementById('attachments');
      container.innerHTML = '<div class="loading">Loading attachments...</div>';

      try {
        const attachments = await API.listAttachments();

        if (attachments.length === 0) {
          container.innerHTML = '<div class="empty">No attachments yet. Send an email with attachments to get started!</div>';
          return;
        }

        container.innerHTML = attachments.map(att => {
          const isImage = att.mimeType.startsWith('image/');
          const icon = getFileIcon(att.mimeType);
          const size = formatSize(att.size);
          const date = new Date(att.uploaded).toLocaleString();

          return \`
            <div class="attachment">
              <div class="preview">
                \${isImage
                  ? \`<img src="\${API.getFileUrl(att.key)}" alt="\${att.filename}">\`
                  : icon
                }
              </div>
              <div class="details">
                <div class="filename">\${att.filename}</div>
                <div class="meta">
                  <span>From: \${att.from}</span>
                  <span>Size: \${size}</span>
                  <span>\${date}</span>
                </div>
                \${att.subject ? \`<div class="meta">Subject: \${att.subject}</div>\` : ''}
              </div>
              <div class="actions">
                <a href="\${API.getFileUrl(att.key)}" target="_blank" class="btn btn-view">View</a>
                <a href="\${API.getFileUrl(att.key)}?download" class="btn btn-download">Download</a>
                <button class="btn btn-delete" onclick="deleteFile('\${att.key}')">Delete</button>
              </div>
            </div>
          \`;
        }).join('');
      } catch (error) {
        container.innerHTML = '<div class="empty">Error loading attachments. Please try again.</div>';
        console.error(error);
      }
    }

    async function deleteFile(key) {
      if (!confirm('Delete this attachment?')) return;

      try {
        await API.deleteFile(key);
        loadAttachments();
      } catch (error) {
        alert('Error deleting file');
        console.error(error);
      }
    }

    function getFileIcon(mimeType) {
      if (mimeType.startsWith('image/')) return '🖼️';
      if (mimeType.startsWith('video/')) return '🎬';
      if (mimeType.startsWith('audio/')) return '🎵';
      if (mimeType.includes('pdf')) return '📄';
      if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
      if (mimeType.includes('text') || mimeType.includes('document')) return '📝';
      if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
      return '📎';
    }

    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    loadAttachments();
  </script>
</body>
</html>`;
}
