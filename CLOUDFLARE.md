# Cloudflare Pages Deployment

This project can be deployed to Cloudflare Pages without changing the existing frontend routes or interface.

## Recommended Cloudflare Pages settings

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Functions directory:** `functions` at the project root

The `/api/practice-engine` route is provided by a Cloudflare Pages Function, so the existing frontend request path remains unchanged.

## Environment variables and secrets

Configure server-side secrets in **Cloudflare Pages → Settings → Environment variables**.

Use one or both of these names:

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`

Do **not** expose these keys as `VITE_` variables. The browser should continue calling `/api/practice-engine`; the Pages Function reads the secrets server-side.

If neither key is configured, the existing fallback reflection response is still returned.

## Local development options

For the existing Express-based local server:

```bash
npm install
npm run dev
```

For a Cloudflare Pages production build:

```bash
npm run build
```

If you need to build the old Node/Express server bundle for a non-Cloudflare target, use:

```bash
npm run build:server
```

## Mini CMS bindings

This project includes an optional Cloudflare-native mini CMS at `/admin`.

Create a KV namespace and bind it to the Pages project:

- **Variable name:** `CMS_CONTENT`
- **KV namespace:** your CMS namespace, for example `SECOND_THOUGHT_CMS`

Protect these paths with Cloudflare Access:

```text
/admin*
/api/cms/save
```
