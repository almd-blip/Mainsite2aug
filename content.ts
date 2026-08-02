interface CmsKvNamespace {
  get<T = unknown>(key: string, type: 'json'): Promise<T | null>;
  get(key: string): Promise<string | null>;
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

export async function onRequestGet(context: PagesFunctionContext<CmsEnv>): Promise<Response> {
  if (!context.env.CMS_CONTENT) {
    return jsonResponse({ values: {}, warning: 'CMS_CONTENT KV binding is not configured.' });
  }

  const values = await context.env.CMS_CONTENT.get<Record<string, string>>(CMS_KEY, 'json');
  return jsonResponse({ values: values || {} });
}

export async function onRequest(context: PagesFunctionContext<CmsEnv>): Promise<Response> {
  if (context.request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  return onRequestGet(context);
}
