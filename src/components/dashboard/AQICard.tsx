import { MapPin, Clock, Droplets, Wind, Thermometer } from "lucide-react";
import { AQIGauge } from "./AQIGauge";
import { Shimmer } from "./Skeletons";
import { getAQICategory } from "@/utils/aqiCategoryConfig";
import type { CurrentAQIDTO } from "@/services/aqiService";

function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)} h ago`;
}

export function AQICardSkeleton() {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
        <Shimmer className="size-[200px] rounded-full" />
        <div className="w-full space-y-3">
          <Shimmer className="h-4 w-40" />
          <Shimmer className="h-9 w-56" />
          <Shimmer className="h-4 w-64" />
          <Shimmer className="h-16 w-full" />
        </div>
      </div>
    </section>
  );
}

export function AQICard({ data }: { data: CurrentAQIDTO }) {
  const cat = getAQICategory(data.aqi);
  const dominant = data.pollutants.find((p) => p.key === data.dominantPollutant);

  return (
    <section
      aria-labelledby="current-aqi-heading"
      className={`overflow-hidden rounded-3xl border bg-card p-6 sm:p-8 ${cat.border}`}
    >
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-10">
        <AQIGauge value={data.aqi} />

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {data.location.city}, {data.location.state}
            </span>
          </p>

          <h2 id="current-aqi-heading" className="mt-2 font-display text-4xl tracking-tight">
            <span className={cat.text}>{cat.label}</span> air quality
          </h2>

          <p className="mt-2 max-w-prose text-sm text-muted-foreground">{cat.summary}</p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${cat.bg} ${cat.border} ${cat.text}`}
            >
              {cat.label} · {cat.min}–{cat.max}
            </span>
            {dominant && (
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                Dominant: {dominant.label}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" aria-hidden="true" />
              Updated {timeAgo(data.updatedAt)}
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-4 text-left">
            <div>
              <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                <Thermometer className="size-3.5" aria-hidden="true" /> Temp
              </dt>
              <dd className="mt-1 text-lg tabular-nums">{data.temperatureC}°C</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                <Droplets className="size-3.5" aria-hidden="true" /> Humidity
              </dt>
              <dd className="mt-1 text-lg tabular-nums">{data.humidityPct}%</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                <Wind className="size-3.5" aria-hidden="true" /> Wind
              </dt>
              <dd className="mt-1 text-lg tabular-nums">{data.windKph} km/h</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
