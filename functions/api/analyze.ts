import { analyzePost } from '../../src/utils/instagramExtractor';

interface Env {
  META_ACCESS_TOKEN?: string;
  [key: string]: unknown;
}

interface EventContext<EnvType = Env> {
  request: Request;
  env: EnvType;
  params?: Record<string, string | string[]>;
  waitUntil?: (promise: Promise<unknown>) => void;
  next?: () => Promise<Response>;
  data?: Record<string, unknown>;
}

export const onRequestPost = async (context: EventContext): Promise<Response> => {
  try {
    const body = (await context.request.json()) as { url?: string };
    const targetUrl = body?.url?.trim();

    if (!targetUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No URL provided.',
          statusMessage: 'Please provide a valid Instagram or Threads URL.',
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

    const metaToken = (context.env?.META_ACCESS_TOKEN as string) || undefined;
    const result = await analyzePost(targetUrl, metaToken);

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
};

export const onRequestOptions = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
