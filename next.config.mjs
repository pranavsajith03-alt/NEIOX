const isDev = process.env.NODE_ENV !== 'production';

/* ── Content-Security-Policy ──────────────────────────────────────────────
   - script-src/style-src need 'unsafe-inline': the App Router streams RSC
     payloads via inline `<script>` tags (self.__next_f.push(...)) on every
     page, and many components (e.g. components/AQIWidget.tsx) render
     <style>{...}</style> blocks / inline `style={{}}` props. Removing
     'unsafe-inline' without a nonce-based rewrite would break hydration
     and most of the marketing site's styling.
   - 'unsafe-eval' is dev-only — Next's Fast Refresh/webpack HMR uses eval.
   - style-src/font-src allowlist the external font hosts loaded in
     app/layout.tsx (Google Fonts, fonts.cdnfonts.com for Cal Sans).
   - img-src allows the Unsplash images used across the marketing
     components and Supabase Storage (avatars / uploaded files).
   - connect-src allows the Supabase project (REST + Realtime). The WAQI
     air-quality API is called server-side only, via app/api/aqi/route.ts
     (components/AQIWidget.tsx fetches that same-origin route), so
     api.waqi.info does not need a browser connect-src entry.
─────────────────────────────────────────────────────────────────────────*/
const CSP_DIRECTIVES = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.cdnfonts.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co",
  "font-src 'self' data: https://fonts.gstatic.com https://fonts.cdnfonts.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: CSP_DIRECTIVES },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
