import { analyzePost } from './src/utils/instagramExtractor';
import { streamMediaDownload } from './src/utils/mediaDownloader';

interface Env {
  META_ACCESS_TOKEN?: string;
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API Route: /api/analyze
    if (url.pathname === '/api/analyze') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }

      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      try {
        const body = (await request.json()) as { url?: string };
        const targetUrl = body?.url?.trim();

        if (!targetUrl) {
          return new Response(
            JSON.stringify({
              success: false,
              urlValid: false,
              postVerified: false,
              previewAvailable: false,
              hasDirectDownload: false,
              error: 'No URL provided.',
              statusMessage: 'Please provide a valid Instagram, Threads, or TikTok URL.',
            }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          );
        }

        const result = await analyzePost(targetUrl, env.META_ACCESS_TOKEN);

        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            success: false,
            urlValid: false,
            postVerified: false,
            previewAvailable: false,
            hasDirectDownload: false,
            error: err?.message || 'Server error occurred during analysis.',
            statusMessage: 'Failed to communicate with analysis service.',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    // API Route: /api/download (Secure streaming proxy for verified media)
    if (url.pathname === '/api/download') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }

      if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const mediaUrl = url.searchParams.get('url');
      const filename = url.searchParams.get('filename') || undefined;

      if (!mediaUrl) {
        return new Response(
          JSON.stringify({ error: 'Missing required "url" parameter.' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return streamMediaDownload(mediaUrl, filename);
    }

    // API Route: /api/health
    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'MediaSave Cloudflare Worker',
          worker: 'media-saver',
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Default: Fallback to static SPA assets in dist/
    return env.ASSETS.fetch(request);
  },
};
