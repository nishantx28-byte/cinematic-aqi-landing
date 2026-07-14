import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Mail, Lock } from "lucide-react";

type Mode = "signin" | "signup";

export function AuthCard({ onSignupSuccess }: { onSignupSuccess?: (name: string) => void } = {}) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="relative w-full max-w-[420px]"
    >
      {/* Ambient glow behind card */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[36px] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,212,184,0.22), rgba(0,212,184,0) 70%)",
        }}
      />

      <div className="glass-card relative rounded-3xl p-8 sm:p-10">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <BrandMark />
          <div className="text-center">
            <h1 className="font-display text-[28px] leading-tight tracking-tight text-foreground">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              {mode === "signin"
                ? "Sign in to continue planning cleaner days."
                : "Start planning around the air you breathe."}
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (mode === "signup") {
              onSignupSuccess?.(name);
            }
          }}
          className="flex flex-col gap-4"
        >
          {mode === "signup" && (
            <FloatingField
              id="name"
              label="Full name"
              value={name}
              onChange={setName}
              autoComplete="name"
            />
          )}
          <FloatingField
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            icon={<Mail className="h-4 w-4" />}
          />
          <FloatingField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            icon={<Lock className="h-4 w-4" />}
          />

          {mode === "signin" && (
            <div className="-mt-1 flex justify-end">
              <button
                type="button"
                className="text-[12px] text-muted-foreground transition-colors hover:text-accent"
              >
                Forgot password?
              </button>
            </div>
          )}

          <motion.button
            type="submit"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="group relative mt-2 flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary text-[14px] font-medium text-primary-foreground shadow-[0_10px_30px_-10px_rgba(0,212,184,0.6)] transition-shadow hover:shadow-[0_14px_40px_-8px_rgba(0,212,184,0.7)]"
          >
            <span className="relative z-10">
              {mode === "signin" ? "Sign in" : "Create account"}
            </span>
            <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
          </motion.button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            or
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-[13px] font-medium text-foreground transition-colors hover:bg-white/[0.08]"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="mt-7 text-center text-[13px] text-muted-foreground">
          {mode === "signin" ? "New to AQI Life Planner?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-medium text-accent transition-colors hover:text-secondary"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </motion.div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  icon?: React.ReactNode;
}

function FloatingField({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  icon,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div className="relative">
      <div
        className={`relative flex items-center rounded-xl border bg-white/[0.03] transition-all duration-300 ${
          focused
            ? "border-primary/60 shadow-[0_0_0_4px_rgba(0,212,184,0.10)]"
            : "border-white/10"
        }`}
      >
        {icon && (
          <span
            className={`pl-3.5 transition-colors ${focused ? "text-primary" : "text-muted-foreground"}`}
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className="peer h-12 w-full bg-transparent px-3.5 pt-4 pb-1 text-[14px] text-foreground outline-none placeholder:text-transparent"
          placeholder={label}
        />
        <label
          htmlFor={id}
          className={`pointer-events-none absolute ${icon ? "left-10" : "left-3.5"} transition-all duration-200 ${
            active
              ? "top-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
              : "top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground/80"
          }`}
        >
          {label}
        </label>
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3C12 3 5 11 5 16a7 7 0 0 0 14 0c0-5-7-13-7-13Z"
            stroke="url(#g)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="16" r="2" fill="var(--color-primary)" />
          <defs>
            <linearGradient id="g" x1="5" y1="3" x2="19" y2="23">
              <stop stopColor="#9EF7EA" />
              <stop offset="1" stopColor="#00D4B8" />
            </linearGradient>
          </defs>
        </svg>
        <div
          aria-hidden
          className="absolute inset-0 rounded-xl opacity-60 blur-md"
          style={{ background: "radial-gradient(circle, rgba(0,212,184,0.4), transparent 70%)" }}
        />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[13px] font-medium tracking-tight text-foreground">
          AQI Life Planner
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Breathe with intention
        </span>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c6.9 0 11.5-4.8 11.5-11.6 0-.8-.1-1.4-.2-2H12z"/>
    </svg>
  );
}
