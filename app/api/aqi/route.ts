/* ─────────────────────────────────────────────────────────────────────────
   app/api/aqi/route.ts

   Server-side proxy for the WAQI (waqi.info) feed.

   WAQI_TOKEN is read from the server environment only (no NEXT_PUBLIC_
   prefix), so it never reaches the client bundle or the browser's
   Network tab. components/AQIWidget.tsx fetches this route instead of
   calling api.waqi.info directly.

   Per-visitor location: since this request originates from our server,
   WAQI's "geo:here" would resolve to *our server's* IP-based location
   for every visitor. To preserve the original per-visitor behaviour, we
   look up the requesting visitor's IP (via getClientIp, same helper used
   by middleware rate-limiting) against a free IP-geolocation service,
   then ask WAQI for the feed at that lat/lon. If the visitor's IP can't
   be resolved (e.g. local dev, lookup failure), we fall back to
   "geo:here" rather than failing outright.

   Response shape is unchanged (`{ status: 'ok' | 'error', data: ... }`),
   matching what AQIWidget already expects.
───────────────────────────────────────────────────────────────────────── */
import { NextResponse, type NextRequest } from 'next/server';
import { logError } from '@/lib/security/logger';
import { getClientIp } from '@/lib/security/rate-limit';

interface GeoLocation {
  lat: number;
  lon: number;
}

const LOCAL_IPS = new Set(['unknown', '127.0.0.1', '::1']);

/* Resolves a visitor IP to coordinates via ipapi.co (no API key required
   for low-volume use). Returns null on any failure so the caller can
   fall back to "geo:here". */
async function resolveVisitorLocation(ip: string): Promise<GeoLocation | null> {
  if (LOCAL_IPS.has(ip)) return null;

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { cache: 'no-store' });
    if (!res.ok) return null;

    const json = await res.json();
    if (typeof json.latitude !== 'number' || typeof json.longitude !== 'number') return null;

    return { lat: json.latitude, lon: json.longitude };
  } catch (error) {
    logError('api/aqi:geo', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const token = process.env.WAQI_TOKEN;

  if (!token) {
    return NextResponse.json({ status: 'error', data: 'AQI service is not configured.' });
  }

  const location = await resolveVisitorLocation(getClientIp(request));
  const feedPath = location ? `geo:${location.lat};${location.lon}` : 'here';

  try {
    const res = await fetch(`https://api.waqi.info/feed/${feedPath}/?token=${token}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      logError('api/aqi', new Error(`WAQI responded with status ${res.status}`));
      return NextResponse.json({ status: 'error', data: 'AQI data is unavailable right now.' });
    }

    const json = await res.json();
    return NextResponse.json(json, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    logError('api/aqi', error);
    return NextResponse.json({ status: 'error', data: 'AQI data is unavailable right now.' });
  }
}
