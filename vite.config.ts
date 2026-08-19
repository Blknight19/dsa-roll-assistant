/// <reference types="vitest/config" />
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Die App lädt nichts aus fremden Quellen: Skripte, Stile, Schriften und Bilder liegen
 * alle im Build. Die Policy schreibt genau das fest, damit eine eingeschleuste Zeile
 * Code weder nachladen noch etwas nach außen senden kann.
 *
 * `style-src` braucht `unsafe-inline`, weil Radix Positionen als Inline-Style setzt.
 *
 * Ohne `require-trusted-types-for 'script'`, obwohl es der schärfste Schutz gegen
 * DOM-XSS wäre: React DOM setzt intern `innerHTML` und die Service-Worker-Anmeldung
 * eine Skript-URL — mit der Direktive startet die App nicht und wäre offline tot.
 * Gegen `dangerouslySetInnerHTML` im eigenen Code steht stattdessen `react/no-danger`
 * in eslint.config.js.
 *
 * `frame-ancestors` fehlt notgedrungen: als <meta> ist es wirkungslos und GitHub Pages
 * setzt keine Header — gegen Clickjacking schützt das hier also nicht.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
].join('; ');

/** Nur im Build: im Dev-Server würde `script-src 'self'` React Refresh abwürgen. */
const cspPlugin = {
  name: 'csp-meta',
  apply: 'build' as const,
  // Hinter das Charset gehängt: das muss als Erstes im head stehen.
  transformIndexHtml: (html: string) =>
    html.replace(
      '<meta charset="UTF-8" />',
      `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`
    ),
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cspPlugin,
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'DSA Roll Assistant',
        short_name: 'DSA Würfel',
        description: 'Digitaler Würfelassistent und Charakterbogen für DSA 5',
        lang: 'de',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        theme_color: '#2a1f13',
        background_color: '#f6f1e8',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
  base: '/dsa-roll-assistant/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
  },
});
