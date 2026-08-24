import { getAQICategory } from "@/utils/aqiCategoryConfig";

export function AQIGauge({ value, size = 200 }: { value: number; size?: number }) {
  const cat = getAQICategory(value);
  const stroke = size * 0.075;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const sweep = 0.75; // 270 degrees
  const pct = Math.max(0, Math.min(1, value / 500));

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Air quality index ${Math.round(value)}, category ${cat.label}`}
    >
      <svg width={size} height={size} className="-rotate-[225deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * sweep} ${c}`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={cat.cssVar}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * sweep * pct} ${c}`}
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-display leading-none tabular-nums ${cat.text}`}
          style={{ fontSize: size * 0.32 }}
        >
          {Math.round(value)}
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          AQI · IN
        </span>
      </div>
    </div>
  );
}
