import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import dotenv from 'dotenv';
import { analyzePost } from './src/utils/instagramExtractor';
import { streamMediaDownload } from './src/utils/mediaDownloader';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Route: Analyze URL
  app.post('/api/analyze', async (req, res) => {
    try {
      const { url } = req.body || {};
      if (!url || typeof url !== 'string') {
        return res.status(400).json({
          success: false,
          urlValid: false,
          postVerified: false,
          previewAvailable: false,
          hasDirectDownload: false,
          error: 'Please provide a valid URL string.',
          statusMessage: 'Invalid URL input.',
        });
      }

      const metaToken = process.env.META_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;
      const result = await analyzePost(url.trim(), metaToken);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (err: any) {
      console.error('API Error in /api/analyze:', err);
      return res.status(500).json({
        success: false,
        urlValid: false,
        postVerified: false,
        previewAvailable: false,
        hasDirectDownload: false,
        error: err?.message || 'Server error during analysis.',
        statusMessage: 'Internal server error while analyzing URL.',
      });
    }
  });

  // API Route: Secure Media Download Stream
  app.get('/api/download', async (req, res) => {
    try {
      const mediaUrl = req.query.url as string;
      const filename = req.query.filename as string | undefined;

      if (!mediaUrl) {
        return res.status(400).json({ error: 'Missing required "url" parameter.' });
      }

      const webRes = await streamMediaDownload(mediaUrl, filename);
      res.status(webRes.status);
      webRes.headers.forEach((val, key) => {
        res.setHeader(key, val);
      });

      if (!webRes.body) {
        return res.end();
      }

      const nodeStream = Readable.fromWeb(webRes.body as any);
      nodeStream.pipe(res);
    } catch (err: any) {
      console.error('API Error in /api/download:', err);
      return res.status(500).json({ error: err?.message || 'Download streaming failed.' });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'MediaSave API', timestamp: new Date().toISOString() });
  });

  if (!isProduction) {
    // Development mode: Mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve static dist assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediaSave server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
