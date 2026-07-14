import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { IntroVideo } from "@/components/IntroVideo";
import { AmbientBackground } from "@/components/AmbientBackground";
import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Persistent ambient scene — starts alive so the video dissolves INTO it */}
      <AmbientBackground />

      {/* Auth surface fades up behind the dissolving video */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: introDone ? 1 : 0 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16"
      >
        <AuthCard />

        <footer className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
            © AQI Life Planner
          </span>
        </footer>
      </motion.section>

      {/* Intro sits on top and dissolves away */}
      <IntroVideo onComplete={() => setIntroDone(true)} />
    </main>
  );
}
