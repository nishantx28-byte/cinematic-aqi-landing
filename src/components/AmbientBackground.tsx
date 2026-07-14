import { useMemo } from "react";

/**
 * Slow-moving ambient background: subtle teal aurora + drifting particles.
 * Pure CSS animations for performance; no JS ticks.
 */
export function AmbientBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => {
        const size = 1 + Math.random() * 2.5;
        return {
          key: i,
          left: Math.random() * 100,
          top: 30 + Math.random() * 90,
          size,
          delay: Math.random() * 14,
          duration: 14 + Math.random() * 18,
          dx: (Math.random() - 0.5) * 120,
          dy: -80 - Math.random() * 200,
          opacity: 0.25 + Math.random() * 0.5,
        };
      }),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(0,212,184,0.10) 0%, rgba(5,7,10,0) 55%), radial-gradient(ellipse at 80% 90%, rgba(88,224,209,0.06) 0%, rgba(5,7,10,0) 60%)",
        }}
      />
      {/* Soft aurora blobs */}
      <div
        className="absolute -left-40 top-1/3 h-[520px] w-[520px] rounded-full opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,184,0.35) 0%, rgba(0,212,184,0) 70%)",
          animation: "aurora-shift 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full opacity-30 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(158,247,234,0.28) 0%, rgba(158,247,234,0) 70%)",
          animation: "aurora-shift 28s ease-in-out infinite reverse",
        }}
      />

      {/* Fine grain via SVG noise */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")",
        }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <span
          key={p.key}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background:
              "radial-gradient(circle, rgba(158,247,234,0.9), rgba(158,247,234,0) 70%)",
            opacity: p.opacity,
            animation: `particle-drift ${p.duration}s linear ${p.delay}s infinite`,
            // @ts-expect-error CSS vars
            "--dx": `${p.dx}px`,
            "--dy": `${p.dy}px`,
          }}
        />
      ))}
    </div>
  );
}
