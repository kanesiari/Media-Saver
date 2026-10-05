import { streamMediaDownload } from '../../src/utils/mediaDownloader';

interface EventContext {
  request: Request;
}

export const onRequestGet = async (context: EventContext): Promise<Response> => {
  const url = new URL(context.request.url);
  const mediaUrl = url.searchParams.get('url');
  const filename = url.searchParams.get('filename') || undefined;

  if (!mediaUrl) {
    return new Response(JSON.stringify({ error: 'Missing required "url" parameter.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return streamMediaDownload(mediaUrl, filename);
};

export const onRequestOptions = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
