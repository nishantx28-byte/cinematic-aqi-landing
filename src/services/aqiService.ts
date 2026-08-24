/**
 * aqiService — mock data layer.
 *
 * Every function here is async and returns plain DTOs, so a real provider
 * (WAQI, OpenWeather Air Pollution, CPCB) can be dropped in behind the same
 * signatures without touching any UI component.
 */

export interface LocationDTO {
  id: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
}

export type PollutantKey = "pm25" | "pm10" | "co" | "no2" | "so2" | "o3";

export interface PollutantDTO {
  key: PollutantKey;
  label: string;
  unit: string;
  value: number;
  /** sub-index on the 0-500 AQI scale, used for status badge */
  subIndex: number;
  trend: "up" | "down" | "flat";
  changePct: number;
  sparkline: number[];
}

export interface CurrentAQIDTO {
  location: LocationDTO;
  aqi: number;
  dominantPollutant: PollutantKey;
  updatedAt: string;
  temperatureC: number;
  humidityPct: number;
  windKph: number;
  pollutants: PollutantDTO[];
}

export type TrendRange = "24h" | "7d" | "30d";

export interface TrendPointDTO {
  t: string;
  label: string;
  aqi: number;
}

const CITIES: LocationDTO[] = [
  { id: "meerut", city: "Meerut", state: "Uttar Pradesh", country: "IN", lat: 28.98, lon: 77.71 },
  { id: "delhi", city: "Delhi", state: "Delhi", country: "IN", lat: 28.61, lon: 77.21 },
  { id: "noida", city: "Noida", state: "Uttar Pradesh", country: "IN", lat: 28.54, lon: 77.39 },
  { id: "ghaziabad", city: "Ghaziabad", state: "Uttar Pradesh", country: "IN", lat: 28.67, lon: 77.45 },
  { id: "lucknow", city: "Lucknow", state: "Uttar Pradesh", country: "IN", lat: 26.85, lon: 80.95 },
  { id: "mumbai", city: "Mumbai", state: "Maharashtra", country: "IN", lat: 19.08, lon: 72.88 },
  { id: "bengaluru", city: "Bengaluru", state: "Karnataka", country: "IN", lat: 12.97, lon: 77.59 },
  { id: "chennai", city: "Chennai", state: "Tamil Nadu", country: "IN", lat: 13.08, lon: 80.27 },
  { id: "kolkata", city: "Kolkata", state: "West Bengal", country: "IN", lat: 22.57, lon: 88.36 },
  { id: "hyderabad", city: "Hyderabad", state: "Telangana", country: "IN", lat: 17.39, lon: 78.49 },
  { id: "pune", city: "Pune", state: "Maharashtra", country: "IN", lat: 18.52, lon: 73.86 },
  { id: "jaipur", city: "Jaipur", state: "Rajasthan", country: "IN", lat: 26.91, lon: 75.79 },
  { id: "ahmedabad", city: "Ahmedabad", state: "Gujarat", country: "IN", lat: 23.02, lon: 72.57 },
  { id: "kanpur", city: "Kanpur", state: "Uttar Pradesh", country: "IN", lat: 26.45, lon: 80.33 },
  { id: "patna", city: "Patna", state: "Bihar", country: "IN", lat: 25.59, lon: 85.13 },
  { id: "shimla", city: "Shimla", state: "Himachal Pradesh", country: "IN", lat: 31.1, lon: 77.17 },
  { id: "kochi", city: "Kochi", state: "Kerala", country: "IN", lat: 9.93, lon: 76.26 },
];

export const DEFAULT_FAVORITES = ["meerut", "delhi", "noida", "ghaziabad", "lucknow"];

/** Deterministic pseudo-random so mock data is stable per city + slot. */
function seeded(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const BASELINE: Record<string, number> = {
  delhi: 348,
  noida: 322,
  ghaziabad: 336,
  meerut: 268,
  lucknow: 241,
  kanpur: 259,
  patna: 233,
  jaipur: 198,
  ahmedabad: 172,
  kolkata: 186,
  mumbai: 143,
  pune: 118,
  hyderabad: 108,
  chennai: 87,
  bengaluru: 74,
  kochi: 46,
  shimla: 38,
};

function baseFor(id: string) {
  return BASELINE[id] ?? 60 + Math.round(seeded(id) * 180);
}

function delay<T>(value: T, ms = 550): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Simulated upstream failure rate so error states are reachable in dev. */
const FAILURE_RATE = 0;

function maybeFail() {
  if (FAILURE_RATE > 0 && Math.random() < FAILURE_RATE) {
    throw new Error("Air quality service is unreachable. Please retry.");
  }
}

const POLLUTANT_META: Record<PollutantKey, { label: string; unit: string; ratio: number; scale: number }> = {
  pm25: { label: "PM2.5", unit: "µg/m³", ratio: 0.62, scale: 1 },
  pm10: { label: "PM10", unit: "µg/m³", ratio: 1.0, scale: 0.9 },
  co: { label: "CO", unit: "mg/m³", ratio: 0.32, scale: 0.02 },
  no2: { label: "NO₂", unit: "µg/m³", ratio: 0.44, scale: 0.35 },
  so2: { label: "SO₂", unit: "µg/m³", ratio: 0.2, scale: 0.14 },
  o3: { label: "O₃", unit: "µg/m³", ratio: 0.3, scale: 0.3 },
};

function hourSlot() {
  return Math.floor(Date.now() / (1000 * 60 * 30));
}

function aqiAt(id: string, slotOffset: number, amplitude = 1) {
  const base = baseFor(id);
  const slot = hourSlot() - slotOffset;
  const wave = Math.sin((slot / 48) * Math.PI * 2) * 0.16 * base;
  const noise = (seeded(`${id}:${slot}`) - 0.5) * 0.18 * base;
  return Math.max(8, Math.min(500, Math.round(base + (wave + noise) * amplitude)));
}

export async function searchLocations(query: string): Promise<LocationDTO[]> {
  const q = query.trim().toLowerCase();
  const results = !q
    ? CITIES.slice(0, 8)
    : CITIES.filter(
        (c) => c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q),
      );
  return delay(results, 250);
}

export async function getLocationById(id: string): Promise<LocationDTO> {
  const found = CITIES.find((c) => c.id === id);
  if (!found) throw new Error(`Unknown location "${id}"`);
  return delay(found, 120);
}

export async function getCurrentAQI(locationId: string): Promise<CurrentAQIDTO> {
  const location = CITIES.find((c) => c.id === locationId);
  if (!location) throw new Error(`Unknown location "${locationId}"`);
  maybeFail();

  const aqi = aqiAt(locationId, 0);
  const pollutants: PollutantDTO[] = (Object.keys(POLLUTANT_META) as PollutantKey[]).map((key) => {
    const meta = POLLUTANT_META[key];
    const jitter = 0.85 + seeded(`${locationId}:${key}`) * 0.3;
    const subIndex = Math.max(5, Math.min(500, Math.round(aqi * meta.ratio * jitter)));
    const sparkline = Array.from({ length: 12 }, (_, i) =>
      Math.round(aqiAt(locationId, 11 - i, 1.3) * meta.ratio * meta.scale * jitter * 10) / 10,
    );
    const first = sparkline[0] ?? 1;
    const last = sparkline[sparkline.length - 1] ?? 1;
    const changePct = first === 0 ? 0 : Math.round(((last - first) / first) * 1000) / 10;
    return {
      key,
      label: meta.label,
      unit: meta.unit,
      value: Math.round(subIndex * meta.scale * 10) / 10,
      subIndex,
      trend: changePct > 2 ? "up" : changePct < -2 ? "down" : "flat",
      changePct,
      sparkline,
    };
  });

  const dominant = pollutants.reduce((a, b) => (b.subIndex > a.subIndex ? b : a));

  return delay({
    location,
    aqi,
    dominantPollutant: dominant.key,
    updatedAt: new Date().toISOString(),
    temperatureC: Math.round(22 + seeded(`${locationId}:temp:${hourSlot()}`) * 14),
    humidityPct: Math.round(38 + seeded(`${locationId}:hum:${hourSlot()}`) * 45),
    windKph: Math.round(4 + seeded(`${locationId}:wind:${hourSlot()}`) * 18),
    pollutants,
  });
}

export async function getAQITrend(
  locationId: string,
  range: TrendRange,
): Promise<TrendPointDTO[]> {
  if (!CITIES.some((c) => c.id === locationId)) {
    throw new Error(`Unknown location "${locationId}"`);
  }
  maybeFail();

  const now = Date.now();
  const config = {
    "24h": { points: 24, stepMs: 3600_000, slotsPerPoint: 2 },
    "7d": { points: 7, stepMs: 86400_000, slotsPerPoint: 48 },
    "30d": { points: 30, stepMs: 86400_000, slotsPerPoint: 48 },
  }[range];

  const data: TrendPointDTO[] = Array.from({ length: config.points }, (_, i) => {
    const back = config.points - 1 - i;
    const date = new Date(now - back * config.stepMs);
    return {
      t: date.toISOString(),
      label:
        range === "24h"
          ? date.toLocaleTimeString("en-IN", { hour: "numeric", hour12: true })
          : date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      aqi: aqiAt(locationId, back * config.slotsPerPoint, range === "24h" ? 1 : 1.25),
    };
  });

  return delay(data, 500);
}

export const _allCities = CITIES;
