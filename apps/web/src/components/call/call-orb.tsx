"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bot, Loader2, Mic } from "lucide-react";

import { cn } from "@/lib/utils";

export type OrbMode =
  | "connecting"
  | "thinking"
  | "idle"
  | "userSpeaking"
  | "agentSpeaking";

// Prop-driven voice orb (adapted from the landing VoiceOrb). The user-speaking
// state reacts to live mic level; the agent-speaking state is a brand-gradient
// pulse — two visually distinct "who's talking" looks.
export function CallOrb({
  mode,
  level = 0,
  size = 200,
}: {
  mode: OrbMode;
  level?: number;
  size?: number;
}) {
  const reduceMotion = useReducedMotion();
  const core = size * 0.5;

  // Mic-reactive scale when the user speaks; gentle breathing otherwise.
  const userScale = 1 + Math.min(level, 1) * 0.35;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer reactive rings */}
      {!reduceMotion && mode === "agentSpeaking" &&
        [0, 1, 2].map((ring) => (
          <motion.span
            key={ring}
            className="absolute rounded-full bg-brand-gradient"
            style={{ width: size, height: size }}
            initial={{ opacity: 0.3, scale: 0.6 }}
            animate={{ opacity: [0.25, 0], scale: [0.6, 1.7] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              delay: ring * 0.45,
              ease: "easeOut",
            }}
          />
        ))}

      {mode === "userSpeaking" && (
        <motion.span
          className="absolute rounded-full border-2 border-accent-sky/60"
          style={{ width: size, height: size }}
          animate={{ scale: reduceMotion ? 1 : userScale, opacity: 0.5 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
        />
      )}

      {/* Core */}
      <motion.div
        className={cn(
          "relative z-10 flex items-center justify-center rounded-full shadow-soft-lg",
          mode === "userSpeaking"
            ? "bg-gradient-to-br from-accent-sky to-brand-pink"
            : "bg-brand-gradient",
        )}
        style={{ width: core, height: core }}
        animate={
          reduceMotion
            ? undefined
            : mode === "userSpeaking"
              ? { scale: userScale }
              : mode === "agentSpeaking"
                ? { scale: [1, 1.08, 1] }
                : { scale: [1, 1.04, 1] }
        }
        transition={
          mode === "userSpeaking"
            ? { duration: 0.12, ease: "easeOut" }
            : {
                duration: mode === "agentSpeaking" ? 0.7 : 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      >
        {mode === "connecting" || mode === "thinking" ? (
          <Loader2 className="size-8 animate-spin text-white" />
        ) : mode === "agentSpeaking" ? (
          <Bot className="size-9 text-white" strokeWidth={2} />
        ) : (
          <Mic className="size-9 text-white" strokeWidth={2} />
        )}
      </motion.div>
    </div>
  );
}
