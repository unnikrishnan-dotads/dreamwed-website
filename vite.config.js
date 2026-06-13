import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to provide a secure, local CORS-safe Google Drive folder scraper proxy
const gdriveProxyPlugin = () => ({
  name: 'gdrive-proxy-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url && req.url.startsWith('/api/gdrive-proxy')) {
        const urlObj = new URL(req.url, `http://${req.headers.host}`);
        const folderId = urlObj.searchParams.get('id');
        
        if (!folderId) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing folder id parameter' }));
          return;
        }
        
        try {
          const targetUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}`;
          const response = await fetch(targetUrl);
          if (!response.ok) {
            res.statusCode = response.status;
            res.end(JSON.stringify({ error: `Failed to fetch from Google Drive, status: ${response.status}` }));
            return;
          }
          const html = await response.text();
          
          // Parse file IDs with high reliability using multiple regexes
          const fileIds = new Set();
          
          // Pattern 1: Standard file/d/FILE_ID links
          const matches1 = html.matchAll(/\/file\/d\/([a-zA-Z0-9_-]{25,45})/g);
          for (const match of matches1) {
            if (match[1]) fileIds.add(match[1]);
          }
          
          // Pattern 2: googleusercontent/d/FILE_ID images
          const matches2 = html.matchAll(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{25,45})/g);
          for (const match of matches2) {
            if (match[1]) fileIds.add(match[1]);
          }
          
          // Pattern 3: drive.google.com/uc?id=FILE_ID
          const matches3 = html.matchAll(/id\=([a-zA-Z0-9_-]{25,45})/g);
          for (const match of matches3) {
            if (match[1]) fileIds.add(match[1]);
          }
          
          const photos = Array.from(fileIds).map((id, index) => ({
            id: `gdrive-photo-${id}-${index}`,
            url: `https://drive.google.com/thumbnail?id=${id}&sz=w800`
          }));
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ photos }));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
        return;
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), gdriveProxyPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

