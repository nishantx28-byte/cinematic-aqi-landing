export type AQICategoryKey =
  | "good"
  | "satisfactory"
  | "moderate"
  | "poor"
  | "verypoor"
  | "severe";

export interface AQICategory {
  key: AQICategoryKey;
  label: string;
  min: number;
  max: number;
  /** Tailwind text color class bound to a design token */
  text: string;
  bg: string;
  border: string;
  /** Raw CSS var for charts / svg strokes */
  cssVar: string;
  summary: string;
}

export const AQI_CATEGORIES: AQICategory[] = [
  {
    key: "good",
    label: "Good",
    min: 0,
    max: 50,
    text: "text-aqi-good",
    bg: "bg-aqi-good/12",
    border: "border-aqi-good/35",
    cssVar: "var(--aqi-good)",
    summary: "Air quality is clean. Perfect day to be outdoors.",
  },
  {
    key: "satisfactory",
    label: "Satisfactory",
    min: 51,
    max: 100,
    text: "text-aqi-satisfactory",
    bg: "bg-aqi-satisfactory/12",
    border: "border-aqi-satisfactory/35",
    cssVar: "var(--aqi-satisfactory)",
    summary: "Acceptable air. Very sensitive people may notice minor discomfort.",
  },
  {
    key: "moderate",
    label: "Moderate",
    min: 101,
    max: 200,
    text: "text-aqi-moderate",
    bg: "bg-aqi-moderate/12",
    border: "border-aqi-moderate/35",
    cssVar: "var(--aqi-moderate)",
    summary: "Breathing discomfort possible for people with lung or heart conditions.",
  },
  {
    key: "poor",
    label: "Poor",
    min: 201,
    max: 300,
    text: "text-aqi-poor",
    bg: "bg-aqi-poor/12",
    border: "border-aqi-poor/35",
    cssVar: "var(--aqi-poor)",
    summary: "Breathing discomfort for most people on prolonged exposure.",
  },
  {
    key: "verypoor",
    label: "Very Poor",
    min: 301,
    max: 400,
    text: "text-aqi-verypoor",
    bg: "bg-aqi-verypoor/12",
    border: "border-aqi-verypoor/35",
    cssVar: "var(--aqi-verypoor)",
    summary: "Respiratory illness likely on prolonged exposure. Limit outdoor time.",
  },
  {
    key: "severe",
    label: "Severe",
    min: 401,
    max: 500,
    text: "text-aqi-severe",
    bg: "bg-aqi-severe/12",
    border: "border-aqi-severe/35",
    cssVar: "var(--aqi-severe)",
    summary: "Serious health effects for everyone. Stay indoors.",
  },
];

export function getAQICategory(value: number): AQICategory {
  const v = Math.max(0, Math.min(500, Math.round(value)));
  return AQI_CATEGORIES.find((c) => v >= c.min && v <= c.max) ?? AQI_CATEGORIES[5]!;
}

export interface HealthAdvice {
  general: string;
  children: string;
  elderly: string;
  respiratory: string;
  headline: string;
}

export const HEALTH_ADVICE: Record<AQICategoryKey, HealthAdvice> = {
  good: {
    headline: "Great day to be outside",
    general: "Enjoy outdoor activity freely — running, cycling, open windows.",
    children: "Outdoor play is completely safe. No restrictions needed.",
    elderly: "Ideal conditions for morning and evening walks.",
    respiratory: "No precautions required. Keep your usual medication routine.",
  },
  satisfactory: {
    headline: "Fine for most people",
    general: "Normal outdoor activity is fine. Air is mildly polluted.",
    children: "Safe for outdoor play; watch for coughing during long sessions.",
    elderly: "Comfortable for walks. Prefer early morning hours.",
    respiratory: "Unusually sensitive individuals should carry an inhaler outdoors.",
  },
  moderate: {
    headline: "Take it easy outdoors",
    general: "Reduce long or intense outdoor exercise. Keep windows shut at peak traffic hours.",
    children: "Limit outdoor play to under an hour. Prefer indoor games in the evening.",
    elderly: "Shorten walks and avoid busy roads. Consider a mask outdoors.",
    respiratory: "Keep reliever medication handy and avoid outdoor exertion.",
  },
  poor: {
    headline: "Limit outdoor exposure",
    general: "Avoid outdoor exercise. Use an N95 mask when stepping out.",
    children: "Keep children indoors. Cancel outdoor sports and playground time.",
    elderly: "Stay indoors where possible. Run an air purifier if available.",
    respiratory: "High risk of flare-ups. Stay indoors and follow your action plan.",
  },
  verypoor: {
    headline: "Stay indoors where you can",
    general: "Avoid all outdoor exertion. Seal windows and use purification indoors.",
    children: "Keep children home. Watch for wheezing, coughing or eye irritation.",
    elderly: "Remain indoors. Seek care for chest tightness or breathlessness.",
    respiratory: "Serious risk. Keep medication close and contact your doctor if symptoms rise.",
  },
  severe: {
    headline: "Health emergency conditions",
    general: "Everyone should stay indoors with windows sealed. Avoid any outdoor activity.",
    children: "Do not take children outside. Schools should suspend outdoor activity.",
    elderly: "Remain indoors at all times. Arrange help for essential errands.",
    respiratory: "Emergency-level exposure. Follow your medical plan and seek help early.",
  },
};

export const HEALTH_DISCLAIMER =
  "This guidance is informational only and is not medical advice. Consult a qualified doctor for health decisions.";
