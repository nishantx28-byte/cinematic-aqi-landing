import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import introAsset from "@/assets/web_intro.mp4.asset.json";

interface IntroVideoProps {
  onComplete: () => void;
}

/**
 * Fullscreen cinematic intro. Cross-dissolves into the app via a soft
 * blur + fade with teal bloom. No controls, no chrome.
 */
export function IntroVideo({ onComplete }: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [dissolving, setDissolving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      // Autoplay blocked → skip straight through
      startDissolve();
    });

    const onTime = () => {
      if (!v.duration) return;
      // Begin dissolve ~700ms before end for seamless blend
      if (v.duration - v.currentTime <= 0.9 && !dissolving) {
        startDissolve();
      }
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", startDissolve);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", startDissolve);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startDissolve() {
    if (dissolving) return;
    setDissolving(true);
    // After the dissolve, unmount and signal complete
    window.setTimeout(() => {
      onComplete();
      setGone(true);
    }, 1400);
  }

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-50 overflow-hidden bg-background"
          initial={{ opacity: 1 }}
          animate={{
            opacity: dissolving ? 0 : 1,
            filter: dissolving ? "blur(24px)" : "blur(0px)",
            scale: dissolving ? 1.06 : 1,
          }}
          transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
        >
          <video
            ref={videoRef}
            src={introAsset.url}
            className="h-full w-full object-cover"
            muted
            playsInline
            autoPlay
            preload="auto"
          />

          {/* Bloom overlay that intensifies as we dissolve */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: dissolving ? 1 : 0 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(0,212,184,0.25) 0%, rgba(5,7,10,0) 55%), linear-gradient(180deg, rgba(5,7,10,0.2) 0%, rgba(5,7,10,0.85) 100%)",
            }}
          />

          {/* Skip button — discreet */}
          <button
            onClick={startDissolve}
            className="absolute bottom-6 right-6 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em] text-white/70 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Skip intro"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
