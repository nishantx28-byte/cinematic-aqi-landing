import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  MapPin,
  User,
  Users,
  Baby,
  UserRound,
  Wind,
  Sparkles,
  Cigarette,
} from "lucide-react";

export interface OnboardingAnswers {
  name: string;
  age: number | null;
  gender: string;
  conditions: string[];
  smoking: string;
  concernedFor: string;
  location: { mode: "geo" | "manual"; city?: string } | null;
}

const EMPTY: OnboardingAnswers = {
  name: "",
  age: null,
  gender: "",
  conditions: [],
  smoking: "",
  concernedFor: "",
  location: null,
};

const TOTAL_STEPS = 8; // step indices 1..8; step 0 = welcome, step 9 = finalizing

export function Onboarding({
  onComplete,
}: {
  onComplete: (answers: OnboardingAnswers) => void;
}) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [city, setCity] = useState("");
  const [finalizing, setFinalizing] = useState(false);

  const progress = useMemo(() => {
    if (step === 0) return 0;
    if (finalizing) return 100;
    return Math.min(100, Math.round((step / TOTAL_STEPS) * 100));
  }, [step, finalizing]);

  const go = (next: number) => {
    setError(null);
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const validateAndNext = () => {
    if (step === 1 && !answers.name.trim()) return setError("Please enter your name");
    if (step === 2) {
      const a = answers.age;
      if (!a || a < 10 || a > 100) return setError("Age must be between 10 and 100");
    }
    if (step === 3 && !answers.gender) return setError("Please select an option");
    if (step === 4 && answers.conditions.length === 0)
      return setError("Select at least one option");
    if (step === 5 && !answers.smoking) return setError("Please select an option");
    if (step === 6 && !answers.concernedFor) return setError("Please select an option");
    if (step < TOTAL_STEPS) return go(step + 1);
  };

  const finish = async (loc: OnboardingAnswers["location"]) => {
    const final = { ...answers, location: loc };
    setAnswers(final);
    setFinalizing(true);
    try {
      localStorage.setItem("aqi.onboarding", JSON.stringify(final));
    } catch {}
    // Premium fake pipeline: fetch aqi → build profile → done
    await new Promise((r) => setTimeout(r, 2600));
    onComplete(final);
  };

  const requestGeo = () => {
    if (!("geolocation" in navigator)) {
      setManualMode(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => finish({ mode: "geo" }),
      () => setManualMode(true),
      { timeout: 8000 },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-40 flex items-center justify-center px-5 py-10"
    >
      {/* Backdrop wash */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-xl" />

      <div className="relative w-full max-w-[560px]">
        {/* Progress */}
        <div className="mb-6 flex items-center gap-3 px-1">
          <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
                boxShadow: "0 0 20px -2px color-mix(in oklab, var(--color-primary) 70%, transparent)",
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
            {finalizing ? "Done" : `${Math.min(step, TOTAL_STEPS)}/${TOTAL_STEPS}`}
          </span>
        </div>

        {/* Card */}
        <div className="glass-card relative overflow-hidden rounded-3xl p-8 sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-60 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(0,212,184,0.25), rgba(0,212,184,0) 70%)",
            }}
          />

          <div className="relative min-h-[360px]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={finalizing ? "final" : step}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -dir * 40, filter: "blur(8px)" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {finalizing ? (
                  <Finalizing />
                ) : step === 0 ? (
                  <Welcome onNext={() => go(1)} />
                ) : step === 1 ? (
                  <NameStep
                    value={answers.name}
                    onChange={(v) => setAnswers({ ...answers, name: v })}
                  />
                ) : step === 2 ? (
                  <AgeStep
                    value={answers.age}
                    onChange={(v) => setAnswers({ ...answers, age: v })}
                  />
                ) : step === 3 ? (
                  <CardChoice
                    title="Select your gender"
                    subtitle="This helps us tailor health recommendations."
                    value={answers.gender}
                    onChange={(v) => setAnswers({ ...answers, gender: v })}
                    options={[
                      { value: "male", label: "Male", icon: <UserRound className="h-5 w-5" /> },
                      { value: "female", label: "Female", icon: <UserRound className="h-5 w-5" /> },
                      { value: "other", label: "Other", icon: <User className="h-5 w-5" /> },
                      { value: "na", label: "Prefer not to say", icon: <User className="h-5 w-5" /> },
                    ]}
                  />
                ) : step === 4 ? (
                  <MultiCardChoice
                    title="Any respiratory conditions?"
                    subtitle="Select all that apply. We keep this private."
                    values={answers.conditions}
                    exclusive="none"
                    onChange={(v) => setAnswers({ ...answers, conditions: v })}
                    options={[
                      { value: "asthma", label: "Asthma" },
                      { value: "copd", label: "COPD" },
                      { value: "allergies", label: "Allergies" },
                      { value: "none", label: "None" },
                    ]}
                  />
                ) : step === 5 ? (
                  <CardChoice
                    title="Do you smoke?"
                    subtitle="Smoking affects how air quality impacts you."
                    value={answers.smoking}
                    onChange={(v) => setAnswers({ ...answers, smoking: v })}
                    options={[
                      { value: "never", label: "Never", icon: <Wind className="h-5 w-5" /> },
                      { value: "occasionally", label: "Occasionally", icon: <Cigarette className="h-5 w-5" /> },
                      { value: "regularly", label: "Regularly", icon: <Cigarette className="h-5 w-5" /> },
                      { value: "former", label: "Former Smoker", icon: <Wind className="h-5 w-5" /> },
                    ]}
                  />
                ) : step === 6 ? (
                  <CardChoice
                    title="Whose health matters most to you?"
                    subtitle="We'll prioritize guidance around them."
                    value={answers.concernedFor}
                    onChange={(v) => setAnswers({ ...answers, concernedFor: v })}
                    options={[
                      { value: "self", label: "Myself", icon: <User className="h-5 w-5" /> },
                      { value: "child", label: "My Child", icon: <Baby className="h-5 w-5" /> },
                      { value: "elderly", label: "Elderly Family Member", icon: <UserRound className="h-5 w-5" /> },
                      { value: "family", label: "Entire Family", icon: <Users className="h-5 w-5" /> },
                    ]}
                  />
                ) : step === 7 ? (
                  <LocationStep
                    manualMode={manualMode}
                    city={city}
                    setCity={setCity}
                    onAllow={requestGeo}
                    onManual={() => setManualMode(true)}
                    onSubmitCity={() => {
                      if (!city.trim()) return setError("Enter a city");
                      finish({ mode: "manual", city: city.trim() });
                    }}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-[12px] text-red-300/90"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Nav */}
          {!finalizing && step > 0 && step < 7 && (
            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                onClick={() => go(Math.max(0, step - 1))}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <PrimaryButton onClick={validateAndNext}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Sub-components ---------- */

function PrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      className="group relative flex h-11 items-center gap-2 overflow-hidden rounded-xl bg-primary px-5 text-[13px] font-medium text-primary-foreground shadow-[0_10px_30px_-10px_rgba(0,212,184,0.6)] transition-shadow hover:shadow-[0_14px_40px_-8px_rgba(0,212,184,0.7)]"
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
    </motion.button>
  );
}

function StepHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-7 text-center">
      {eyebrow && (
        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-accent/80">{eyebrow}</p>
      )}
      <h2 className="font-display text-[30px] leading-[1.1] tracking-tight text-foreground sm:text-[34px]">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <Sparkles className="h-7 w-7 text-accent" />
      </div>
      <h2 className="font-display text-[34px] leading-[1.05] tracking-tight text-foreground sm:text-[40px]">
        Welcome to AQI Life Planner
      </h2>
      <p className="mx-auto mt-4 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
        Let's personalize your experience. This will only take about a minute.
      </p>
      <div className="mt-10">
        <PrimaryButton onClick={onNext}>
          Get Started
          <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
      </div>
    </div>
  );
}

function NameStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <StepHeader eyebrow="Step 1" title="What should we call you?" />
      <BigInput
        value={value}
        onChange={onChange}
        placeholder="Enter your name"
        autoFocus
      />
    </div>
  );
}

function AgeStep({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div>
      <StepHeader eyebrow="Step 2" title="How old are you?" subtitle="Between 10 and 100." />
      <BigInput
        value={value === null ? "" : String(value)}
        onChange={(v) => {
          if (v === "") return onChange(null);
          const n = parseInt(v.replace(/[^\d]/g, ""), 10);
          onChange(isNaN(n) ? null : n);
        }}
        placeholder="Your age"
        inputMode="numeric"
        autoFocus
      />
    </div>
  );
}

function BigInput({
  value,
  onChange,
  placeholder,
  autoFocus,
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  inputMode?: "text" | "numeric";
}) {
  return (
    <div className="mx-auto max-w-sm">
      <input
        autoFocus={autoFocus}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-b border-white/15 bg-transparent pb-3 pt-1 text-center font-display text-[28px] tracking-tight text-foreground outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary/70 focus:shadow-[0_1px_0_0_var(--color-primary)]"
      />
    </div>
  );
}

interface Opt {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

function CardChoice({
  title,
  subtitle,
  value,
  onChange,
  options,
}: {
  title: string;
  subtitle?: string;
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
}) {
  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`group relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ${
                selected
                  ? "border-primary/60 bg-primary/[0.08] shadow-[0_0_0_4px_rgba(0,212,184,0.08)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              {o.icon && (
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                    selected
                      ? "border-primary/40 bg-primary/15 text-accent"
                      : "border-white/10 bg-white/[0.03] text-muted-foreground"
                  }`}
                >
                  {o.icon}
                </span>
              )}
              <span className="flex-1 text-[13.5px] font-medium text-foreground">{o.label}</span>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-white/15"
                }`}
              >
                {selected && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiCardChoice({
  title,
  subtitle,
  values,
  onChange,
  options,
  exclusive,
}: {
  title: string;
  subtitle?: string;
  values: string[];
  onChange: (v: string[]) => void;
  options: Opt[];
  exclusive?: string;
}) {
  const toggle = (v: string) => {
    if (exclusive && v === exclusive) return onChange(values.includes(v) ? [] : [v]);
    const without = values.filter((x) => x !== exclusive);
    onChange(
      without.includes(v) ? without.filter((x) => x !== v) : [...without, v],
    );
  };
  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {options.map((o) => {
          const selected = values.includes(o.value);
          return (
            <button
              key={o.value}
              onClick={() => toggle(o.value)}
              className={`group relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ${
                selected
                  ? "border-primary/60 bg-primary/[0.08] shadow-[0_0_0_4px_rgba(0,212,184,0.08)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex-1 text-[13.5px] font-medium text-foreground">{o.label}</span>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-white/15"
                }`}
              >
                {selected && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LocationStep({
  manualMode,
  city,
  setCity,
  onAllow,
  onManual,
  onSubmitCity,
}: {
  manualMode: boolean;
  city: string;
  setCity: (v: string) => void;
  onAllow: () => void;
  onManual: () => void;
  onSubmitCity: () => void;
}) {
  return (
    <div>
      <StepHeader
        title="Enable location"
        subtitle="Location gives you accurate, hyper-local AQI recommendations. We never share it."
      />
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <MapPin className="h-8 w-8 text-accent" />
          <span
            aria-hidden
            className="absolute inset-0 rounded-2xl opacity-70 blur-xl"
            style={{ background: "radial-gradient(circle, rgba(0,212,184,0.35), transparent 70%)" }}
          />
        </div>

        {!manualMode ? (
          <div className="mt-2 flex w-full flex-col items-stretch gap-2.5">
            <PrimaryButton onClick={onAllow}>
              Allow Location
              <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
            <button
              onClick={onManual}
              className="h-11 rounded-xl border border-white/10 bg-white/[0.03] text-[13px] font-medium text-foreground transition-colors hover:bg-white/[0.06]"
            >
              Enter city manually
            </button>
          </div>
        ) : (
          <div className="mt-2 flex w-full flex-col gap-3">
            <input
              autoFocus
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. New Delhi"
              className="h-12 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-[14px] text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:shadow-[0_0_0_4px_rgba(0,212,184,0.10)]"
            />
            <PrimaryButton onClick={onSubmitCity}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

function Finalizing() {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="relative mb-8 h-20 w-20">
        <motion.span
          className="absolute inset-0 rounded-full border border-white/10"
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute inset-2 rounded-full border border-primary/40"
          animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(0,212,184,0) 0deg, var(--color-primary) 300deg, rgba(0,212,184,0) 360deg)",
            mask: "radial-gradient(circle, transparent 55%, #000 56%)",
            WebkitMask: "radial-gradient(circle, transparent 55%, #000 56%)",
            animation: "spin 1.6s linear infinite",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-accent" />
        </div>
      </div>
      <h2 className="font-display text-[24px] leading-tight tracking-tight text-foreground">
        Creating your personalized AQI profile
      </h2>
      <p className="mt-3 max-w-xs text-[13px] text-muted-foreground">
        Fetching local air quality, mapping your health signals, and tuning recommendations.
      </p>
    </div>
  );
}
