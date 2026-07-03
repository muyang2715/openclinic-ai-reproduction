"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mic } from "lucide-react";

import { cn } from "@/lib/utils";

type OrbState = "listening" | "thinking" | "speaking";

const SEQUENCE: { state: OrbState; label: string; ms: number }[] = [
  { state: "listening", label: "Listening", ms: 2600 },
  { state: "thinking", label: "Thinking", ms: 1800 },
  { state: "speaking", label: "Speaking", ms: 2800 },
];

function VoiceOrb({
  className,
  size = 132,
}: {
  className?: string;
  size?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const current = SEQUENCE[index]!;

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setTimeout(
      () => setIndex((i) => (i + 1) % SEQUENCE.length),
      current.ms,
    );
    return () => clearTimeout(timer);
  }, [index, current.ms, reduceMotion]);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Pulsing rings */}
        {!reduceMotion &&
          [0, 1, 2].map((ring) => (
            <motion.span
              key={ring}
              className="absolute rounded-full bg-brand-gradient"
              style={{ width: size, height: size }}
              initial={{ opacity: 0.35, scale: 0.7 }}
              animate={{
                opacity: [0.3, 0],
                scale: [0.7, current.state === "thinking" ? 1.2 : 1.7],
              }}
              transition={{
                duration: current.state === "speaking" ? 1.6 : 2.2,
                repeat: Infinity,
                delay: ring * 0.55,
                ease: "easeOut",
              }}
            />
          ))}

        {/* Core orb */}
        <motion.div
          className="relative z-10 flex items-center justify-center rounded-full bg-brand-gradient shadow-soft-lg"
          style={{ width: size * 0.62, height: size * 0.62 }}
          animate={
            reduceMotion
              ? undefined
              : current.state === "thinking"
                ? { scale: [1, 1.04, 1], rotate: [0, 4, -4, 0] }
                : { scale: [1, 1.08, 1] }
          }
          transition={{
            duration: current.state === "speaking" ? 0.7 : 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Mic className="size-7 text-white" strokeWidth={2.25} />
        </motion.div>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 shadow-soft backdrop-blur">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-pink opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-brand-gradient" />
        </span>
        <span className="text-xs font-medium text-foreground">
          {current.label}
          <span className="text-muted-foreground">…</span>
        </span>
      </div>
    </div>
  );
}

export { VoiceOrb };
