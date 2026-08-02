interface CmsKvNamespace {
  put(key: string, value: string): Promise<void>;
}

interface CmsEnv {
  CMS_CONTENT?: CmsKvNamespace;
}

type PagesFunctionContext<Env> = {
  request: Request;
  env: Env;
};

const CMS_KEY = 'site-content-v1';

const jsonResponse = (body: Record<string, any>, status = 200): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
};

const normaliseValues = (rawValues: unknown): Record<string, string> => {
  if (!rawValues || typeof rawValues !== 'object' || Array.isArray(rawValues)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(rawValues as Record<string, unknown>)
      .filter(([key, value]) => typeof key === 'string' && typeof value === 'string')
      .map(([key, value]) => [key, value as string])
  );
};

export async function onRequestPost(context: PagesFunctionContext<CmsEnv>): Promise<Response> {
  if (!context.env.CMS_CONTENT) {
    return jsonResponse({ error: 'CMS_CONTENT KV binding is not configured.' }, 500);
  }

  let body: any;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON request body.' }, 400);
  }

  const values = normaliseValues(body?.values || body);
  await context.env.CMS_CONTENT.put(CMS_KEY, JSON.stringify(values));

  return jsonResponse({ ok: true, savedKeys: Object.keys(values).length });
}

export async function onRequest(context: PagesFunctionContext<CmsEnv>): Promise<Response> {
  if (context.request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  return onRequestPost(context);
}
