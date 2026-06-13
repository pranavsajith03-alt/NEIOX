import { headers } from 'next/headers';

interface WaqiIaqiMetric {
  v: number;
}

interface WaqiCity {
  geo: [number, number];
  name: string;
  url: string;
}

interface WaqiTime {
  s: string;
  tz: string;
  v: number;
  iso: string;
}

interface WaqiData {
  aqi: number;
  idx: number;
  city: WaqiCity;
  dominentpol: string;
  iaqi: Record<string, WaqiIaqiMetric>;
  time: WaqiTime;
}

interface WaqiResponse {
  status: 'ok' | 'error';
  data: WaqiData;
}

interface AqiLevel {
  max: number;
  label: string;
  badgeClass: string;
}

const AQI_LEVELS: AqiLevel[] = [
  { max: 50, label: 'Good', badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  { max: 100, label: 'Moderate', badgeClass: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  { max: 150, label: 'Unhealthy for Sensitive Groups', badgeClass: 'bg-orange-50 text-orange-700 ring-orange-600/20' },
  { max: 200, label: 'Unhealthy', badgeClass: 'bg-red-50 text-red-700 ring-red-600/20' },
  { max: 300, label: 'Very Unhealthy', badgeClass: 'bg-purple-50 text-purple-700 ring-purple-600/20' },
  { max: Infinity, label: 'Hazardous', badgeClass: 'bg-rose-100 text-rose-800 ring-rose-700/30' },
];

const POLLUTANT_LABELS: Record<string, string> = {
  pm25: 'PM2.5',
  pm10: 'PM10',
  o3: 'Ozone (O₃)',
  no2: 'NO₂',
  so2: 'SO₂',
  co: 'CO',
};

function getAqiLevel(aqi: number): AqiLevel {
  return AQI_LEVELS.find((level) => aqi <= level.max) ?? AQI_LEVELS[AQI_LEVELS.length - 1];
}

function getPollutantLabel(code: string): string {
  return POLLUTANT_LABELS[code] ?? code.toUpperCase();
}

interface AqiLookup {
  response: WaqiResponse | null;
  fallbackCity: string | null;
}

async function getAqiData(): Promise<AqiLookup> {
  const headersList = await headers();
  const lat = headersList.get('x-vercel-ip-latitude');
  const lon = headersList.get('x-vercel-ip-longitude');
  const fallbackCity = headersList.get('x-vercel-ip-city');

  const token = process.env.WAQI_TOKEN;
  if (!token) {
    return { response: null, fallbackCity };
  }

  // Vercel's IP-geo headers are only populated on its edge network; local
  // dev and other hosts fall back to WAQI's own IP-based "here" lookup.
  const url = lat && lon
    ? `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${token}`
    : `https://api.waqi.info/feed/here/?token=${token}`;

  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) return { response: null, fallbackCity };

    const json = (await res.json()) as WaqiResponse;
    if (json.status !== 'ok') return { response: null, fallbackCity };

    return { response: json, fallbackCity };
  } catch {
    return { response: null, fallbackCity };
  }
}

export default async function AQIWidget() {
  const { response, fallbackCity } = await getAqiData();

  if (!response) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          AQI Live
        </h3>
        <p className="mt-3 text-sm text-slate-500">
          Air quality data is currently unavailable.
        </p>
      </div>
    );
  }

  const { aqi, city, dominentpol } = response.data;
  const level = getAqiLevel(aqi);
  const pollutant = getPollutantLabel(dominentpol);
  const locationName = city?.name?.split(',')[0]?.trim() || fallbackCity || 'Nearby station';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          AQI Live
        </h3>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${level.badgeClass}`}>
          {level.label}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tracking-tight text-slate-900">
          {aqi}
        </span>
        <span className="text-xs font-medium text-slate-400">US AQI</span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        {locationName} &middot; Dominant pollutant:{' '}
        <span className="font-medium text-slate-700">{pollutant}</span>
      </p>
    </div>
  );
}
