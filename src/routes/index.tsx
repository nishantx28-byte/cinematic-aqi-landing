import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IntroVideo } from "@/components/IntroVideo";
import { AmbientBackground } from "@/components/AmbientBackground";
import { AuthCard } from "@/components/AuthCard";
import { Onboarding, type OnboardingAnswers } from "@/components/Onboarding";

export const Route = createFileRoute("/")({
  component: Landing,
});

type Phase = "auth" | "onboarding" | "dashboard";

function Landing() {
  const [introDone, setIntroDone] = useState(false);
  const [phase, setPhase] = useState<Phase>("auth");
  const [profile, setProfile] = useState<OnboardingAnswers | null>(null);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AmbientBackground />

      <AnimatePresence mode="wait">
        {phase === "auth" && (
          <motion.section
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: introDone ? 1 : 0 }}
            exit={{ opacity: 0, filter: "blur(12px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16"
          >
            <AuthCard onSignupSuccess={() => setPhase("onboarding")} />
            <footer className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                © AQI Life Planner
              </span>
            </footer>
          </motion.section>
        )}

        {phase === "onboarding" && (
          <Onboarding
            key="onboarding"
            onComplete={(a) => {
              setProfile(a);
              setPhase("dashboard");
            }}
          />
        )}

        {phase === "dashboard" && (
          <motion.section
            key="dashboard"
            initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16"
          >
            <div className="glass-card w-full max-w-[520px] rounded-3xl p-10 text-center">
              <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-accent/80">
                You're all set
              </p>
              <h1 className="font-display text-[34px] leading-tight tracking-tight">
                Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}.
              </h1>
              <p className="mt-3 text-[13.5px] text-muted-foreground">
                Your personalized AQI dashboard is being crafted. Health settings can be
                edited anytime from Profile → Health Settings.
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <IntroVideo onComplete={() => setIntroDone(true)} />
    </main>
  );
}
