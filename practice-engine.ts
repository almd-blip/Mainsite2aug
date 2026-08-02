/**
 * Cloudflare Pages Function for the Second Thought Practice Engine.
 *
 * Keeps the public API path `/api/practice-engine` unchanged while moving the
 * server runtime from Express to Cloudflare's Pages Functions environment.
 */

import {
  handlePracticeEngineRequest,
  type PracticeEngineEnv
} from '../../src/api/practice-engine/route';

type PagesFunctionContext<Env> = {
  request: Request;
  env: Env;
};

const jsonResponse = (body: Record<string, any>, status = 200): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
};

export async function onRequestPost(
  context: PagesFunctionContext<PracticeEngineEnv>
): Promise<Response> {
  let body: unknown;

  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON request body.' }, 400);
  }

  const result = await handlePracticeEngineRequest(body as any, context.env);
  return jsonResponse(result.body, result.status);
}

export async function onRequest(
  context: PagesFunctionContext<PracticeEngineEnv>
): Promise<Response> {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Allow: 'POST'
      }
    });
  }

  return onRequestPost(context);
}
