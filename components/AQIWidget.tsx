'use client';
// components/AQIWidget.tsx
// Live Air Quality Index widget for the visitor's current location,
// powered by the WAQI "geo:here" feed (resolves the nearest station
// from the visitor's IP-based location).

import { Component, useEffect, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

const POLLUTANT_LABELS: Record<string, string> = {
  pm25: 'PM2.5',
  pm10: 'PM10',
  o3:   'O₃',
  no2:  'NO₂',
  so2:  'SO₂',
  co:   'CO',
};

interface AQIReading {
  aqi: number;
  stationName: string;
  dominantPollutant: string;
  pm25Trend: number[] | null;
}

interface AQICategory {
  label: string;
  color: string;
}

function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50)  return { label: 'Good',                          color: '#a4d48a' };
  if (aqi <= 100) return { label: 'Moderate',                       color: '#ffd166' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#f4a261' };
  if (aqi <= 200) return { label: 'Unhealthy',                      color: '#ee6c4d' };
  if (aqi <= 300) return { label: 'Very Unhealthy',                 color: '#c77dff' };
  return               { label: 'Hazardous',                        color: '#ef476f' };
}

function formatStationName(rawName: string): string {
  return rawName.split(',')[0]?.trim() || rawName;
}

function formatPollutant(code: string): string {
  return POLLUTANT_LABELS[code.toLowerCase()] ?? code.toUpperCase();
}

function buildSparklinePoints(values: number[]): string {
  const min    = Math.min(...values);
  const max    = Math.max(...values);
  const range  = max - min || 1;
  const stepX  = 80 / (values.length - 1);

  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = 22 - ((v - min) / range) * 20;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

/* ── Shared label row ─────────────────────────────────────────────── */
function AQIHeader() {
  return (
    <div className="flex items-center gap-1.5" style={{ marginBottom: '0.5rem' }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: '#a4d48a', flexShrink: 0,
        animation: 'aqi-pulse 2.5s ease-in-out infinite',
      }} />
      <p style={{
        fontFamily:    '"JetBrains Mono", monospace',
        fontSize:      '10px', fontWeight: 500,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color:         '#a4d48a',
      }}>
        AQI Live
      </p>
    </div>
  );
}

/* ── Inline message (error / unavailable), with optional retry ──────── */
function AQIMessage({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div>
      <p style={{
        fontFamily:   '"Inter", system-ui, sans-serif',
        fontSize:     '12.5px', lineHeight: 1.6,
        color:        'rgba(255,180,170,0.85)',
        marginBottom: onRetry ? '0.6rem' : 0,
      }}>
        {text}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            fontFamily:     '"JetBrains Mono", monospace',
            fontSize:       '10px', letterSpacing: '0.08em', textTransform: 'uppercase',
            color:          '#a4d48a', background: 'transparent',
            border:         '1px solid rgba(164,212,138,0.35)',
            borderRadius:   '9999px', padding: '0.35rem 0.9rem',
            cursor:         'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

/* ── Loading skeleton — mirrors the resolved layout to avoid jumps ──── */
function AQISkeleton() {
  const bar = (width: string, height: string) => ({
    width, height, borderRadius: '4px',
    background: 'rgba(255,255,255,0.08)',
    animation:  'aqi-shimmer 1.6s ease-in-out infinite',
  });

  return (
    <div aria-label="Loading air quality data" aria-live="polite">
      <div style={{ ...bar('64px', '2.75rem'), marginBottom: '10px' }} />
      <div style={{ ...bar('80px', '13px'),    marginBottom: '10px' }} />
      <div style={{ ...bar('100%', '11px'),    marginBottom: '6px'  }} />
      <div style={bar('70%', '11px')} />
    </div>
  );
}

/* ── Resolved reading ─────────────────────────────────────────────── */
function AQIReady({ reading }: { reading: AQIReading }) {
  const category = getAQICategory(reading.aqi);

  return (
    <div>
      <p style={{
        fontFamily:         '"Hanken Grotesk", system-ui, sans-serif',
        fontSize:           '3rem', fontWeight: 700, lineHeight: 1,
        color:              '#ffffff',
        marginBottom:       '2px',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {reading.aqi}
      </p>

      <div className="flex items-center gap-1.5" style={{ marginBottom: '8px' }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: category.color, flexShrink: 0,
        }} />
        <p style={{
          fontFamily: '"Hanken Grotesk", system-ui, sans-serif',
          fontSize:   '13px', fontWeight: 500, color: category.color,
        }}>
          {category.label}
        </p>
      </div>

      <p style={{
        fontFamily:   '"Inter", system-ui, sans-serif',
        fontSize:     '11.5px', lineHeight: 1.6,
        color:        'rgba(255,255,255,0.55)',
        marginBottom: '10px',
      }}>
        {reading.stationName}
        <br />
        Dominant pollutant:{' '}
        <span style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.75)' }}>
          {reading.dominantPollutant}
        </span>
      </p>

      {reading.pm25Trend && reading.pm25Trend.length > 1 && (
        <svg viewBox="0 0 80 24" className="w-full" fill="none"
             stroke={category.color} strokeWidth="1.75"
             strokeLinecap="round" strokeLinejoin="round">
          <polyline points={buildSparklinePoints(reading.pm25Trend)} />
        </svg>
      )}
    </div>
  );
}

/* ── Data-fetching content ───────────────────────────────────────────
   Fetches AQI data from our own /api/aqi route, which proxies the WAQI
   "geo:here" feed server-side (keeping WAQI_TOKEN off the client). ── */
function AQIContent() {
  const [status, setStatus]       = useState<'loading' | 'success' | 'error'>('loading');
  const [reading, setReading]     = useState<AQIReading | null>(null);
  const [errorText, setErrorText] = useState('');
  const [attempt, setAttempt]     = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    (async () => {
      try {
        const res = await fetch('/api/aqi', { cache: 'no-store' });
        if (!res.ok) throw new Error(`AQI request failed (${res.status})`);

        const json = await res.json();

        if (json.status !== 'ok' || !json.data || typeof json.data.aqi !== 'number') {
          throw new Error(
            typeof json.data === 'string'
              ? json.data
              : 'AQI data is unavailable for this location right now.'
          );
        }

        const pm25Daily = json.data.forecast?.daily?.pm25;
        const pm25Trend = Array.isArray(pm25Daily) && pm25Daily.length > 1
          ? pm25Daily.map((d: { avg: number }) => d.avg)
          : null;

        if (cancelled) return;

        setReading({
          aqi:               Math.round(json.data.aqi),
          stationName:       formatStationName(json.data.city?.name ?? 'Nearby Station'),
          dominantPollutant: formatPollutant(json.data.dominentpol ?? 'n/a'),
          pm25Trend,
        });
        setStatus('success');
      } catch (err) {
        if (cancelled) return;
        setErrorText(err instanceof Error ? err.message : 'Unable to load AQI data.');
        setStatus('error');
      }
    })();

    return () => { cancelled = true; };
  }, [attempt]);

  if (status === 'loading') return <AQISkeleton />;
  if (status === 'error')   return <AQIMessage text={errorText} onRetry={() => setAttempt(a => a + 1)} />;
  if (!reading)             return null;

  return <AQIReady reading={reading} />;
}

/* ── Error boundary — catches unexpected render-time failures ───────── */
interface AQIErrorBoundaryState {
  hasError: boolean;
}

class AQIErrorBoundary extends Component<{ children: ReactNode }, AQIErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AQIErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AQIWidget failed to render:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <AQIMessage text="Something went wrong while displaying AQI data." />;
    }
    return this.props.children;
  }
}

/* ── Public component ────────────────────────────────────────────── */
export default function AQIWidget() {
  return (
    <div style={{
      background:     'rgba(10,24,14,0.82)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border:         '1px solid rgba(164,212,138,0.22)',
      borderRadius:   '16px',
      padding:        '1.25rem 1.5rem',
      boxShadow:      '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
    }}>
      <AQIHeader />
      <AQIErrorBoundary>
        <AQIContent />
      </AQIErrorBoundary>

      <style>{`
        @keyframes aqi-pulse {
          0%, 100% { opacity: 1;   transform: scale(1);    }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes aqi-shimmer {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
