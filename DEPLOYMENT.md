# Deployment & Configuration Guide — Second Thought Shell

This document outlines how to build, configure, and deploy the **Second Thought Shell** across various standard web-hosting environments as a fully portable, deployment-agnostic single-page application (SPA).

---

## Architecture Overview

The Second Thought Shell is built using **React, TypeScript, Vite, and Tailwind CSS**. It contains no platform-specific proprietary scripts or vendor-locked APIs, running purely in modern browser client environments. 

- **Production Build Tool**: Vite compiler
- **Output Directory**: `/dist` (Self-contained HTML, CSS, JS, and asset bundle)
- **Data Persistence**: Abstracted via an adapter pattern (`/src/lib/storage.ts`)

---

## 🛠️ Build and Export Instructions

To build a deployment-ready static bundle locally or inside a CI/CD pipeline, execute the following standard scripts:

### 1. Install Dependencies
```bash
npm install
# or using bun
bun install
```

### 2. Run the Static Production Build
```bash
npm run build
```
This processes all assets, strips TypeScript typing, styles everything via the Tailwind compiler, and outputs optimized files to the `/dist` directory.

### 3. Locally Preview the Production Build
```bash
npm run preview
```
This boots a lightweight, local web server serving the static files from `/dist` to verify performance and visual layouts before hosting.

---

## 🚀 Deployment Guides

Because the shell builds to completely flat static assets, you can host it anywhere. Below are the configurations for the four primary deployment targets:

### 1. ▲ Vercel
Vercel recognizes standard Vite apps and deploys them instantly.

* **Project Type**: Vite
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Root Directory**: `./` (Workspace Root)

**Routing Configuration (Vercel-friendly SPA redirects)**:
To handle client-side routing fallback if routes are added in the future, create a `vercel.json` file in the root workspace:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### 2. ◈ Netlify
Netlify will automatically build and publish your Vite application from any linked GitHub or GitLab repository.

* **Build Command**: `npm run build`
* **Publish Directory**: `dist`

**Routing Configuration (Netlify-friendly SPA redirects)**:
To support clean URL fallbacks for client-side routing, add a `_redirects` file to your static build output folder (`dist/` or `public/`):
```text
/*    /index.html   200
```

---

### 3. 🌀 Replit
You can run and preview the Second Thought Shell directly on Replit using standard container configurations.

Create a `.replit` file at the root of your Repl workspace:
```toml
run = "npm run dev"

[packager]
language = "typescript"

[languages.typescript]
pattern = "**/*.ts"
```
Replit will automatically read the `dev` script from `package.json`, install dependencies, and spin up the preview interface on port `3000`.

To build and serve the production version inside a Repl:
```bash
npm run build
npx serve -s dist -l 3000
```

---

### 4. 🗄️ Static HTML / SFTP Hosting (CPanel, Apache, Nginx)
For traditional static hosting providers (such as GitHub Pages, AWS S3, Cloudflare Pages, or custom Apache/Nginx webservers):

1. Run `npm run build` to generate the `/dist` bundle.
2. Upload the entire contents of `/dist` to the document root of your webserver (e.g., `public_html/` or `/var/www/html/`).
3. If using Nginx, include this location block in your configuration to handle client-side routing:
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

---

## 💾 Storage Abstraction & Cloud Integration

The Second Thought Shell decouples UI state from specific databases. The abstraction layer in `/src/lib/storage.ts` provides a clean `StorageAdapter` interface. 

By default, the shell uses the `LocalStorageAdapter` which requires **zero cloud setup** and persists settings natively in the user's browser.

### Swapping to Cloud Databases
To connect to cloud services like **Firebase Firestore** or **Supabase**, swap the default adapter in `/src/lib/storage.ts`:

#### Example: Integrating Supabase
1. Create a table named `shell_settings` with columns `key` (TEXT, primary key), `value` (JSONB), and `updated_at` (TIMESTAMP).
2. Configure the adapter in `/src/lib/storage.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

export class SupabaseStorageAdapter implements StorageAdapter {
  private supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    const { data, error } = await this.supabase
      .from('shell_settings')
      .select('value')
      .eq('key', key)
      .single();
      
    if (error || !data) return defaultValue;
    return data.value as T;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    await this.supabase
      .from('shell_settings')
      .upsert({ key, value, updated_at: new Date() });
  }

  async removeItem(key: string): Promise<void> {
    await this.supabase
      .from('shell_settings')
      .delete()
      .eq('key', key);
  }

  async clear(): Promise<void> {
    await this.supabase.from('shell_settings').delete().neq('key', '');
  }
}

// Instantiate the Supabase Adapter
export const storage: StorageAdapter = new SupabaseStorageAdapter();
```

---

## 📱 Progressive Web App (PWA) Compatibility

To make the Second Thought Shell fully installable as a native-feeling mobile or desktop app, you can easily turn it into a Progressive Web App (PWA).

### 1. Add a Web App Manifest
Create a `manifest.json` file in your build asset directory (such as `/dist` or `/public` folder):
```json
{
  "short_name": "ST Shell",
  "name": "Second Thought Shell",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#0f172a",
  "background_color": "#f8fafc"
}
```

### 2. Register a Service Worker
Include this lightweight script at the bottom of `/src/main.tsx` to handle offline asset caching and seamless load times:
```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('PWA ServiceWorker registered successfully:', reg.scope);
    }).catch(err => {
      console.warn('PWA ServiceWorker registration failed:', err);
    });
  });
}
```

---

## 🌿 Environment Independence

The app contains **no hardcoded external URLs, regional settings, or API keys**, making it 100% environment-independent:
1. Environment configuration uses Vite-supported `.env` structures.
2. Port binding defaults to dynamically matched browser hosts.
3. Contrast themes and layout options scale responsively from 320px mobile screens to ultra-wide 4K workspaces.
