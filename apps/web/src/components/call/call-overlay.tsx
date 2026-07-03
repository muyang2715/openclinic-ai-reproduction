"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, PhoneOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCall } from "@/hooks/useCall";
import { CallOrb, type OrbMode } from "./call-orb";

export function CallOverlay() {
  const {
    isOpen,
    status,
    userSpeaking,
    agentSpeaking,
    processing,
    micLevel,
    muted,
    transcript,
    endCall,
    toggleMute,
  } = useCall();

  const mode: OrbMode =
    status === "connecting"
      ? "connecting"
      : agentSpeaking
        ? "agentSpeaking"
        : processing
          ? "thinking"
          : userSpeaking && !muted
            ? "userSpeaking"
            : "idle";

  const statusText =
    status === "connecting"
      ? "Connecting…"
      : agentSpeaking
        ? "Agent speaking…"
        : processing
          ? "Thinking…"
          : muted
            ? "Muted"
            : userSpeaking
              ? "You're speaking…"
              : "Listening…";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/70 backdrop-blur-md" />

          <motion.div
            className="relative flex flex-col items-center gap-10 px-6 text-center"
            initial={{ scale: 0.92, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 12 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
          >
            <div className="space-y-2">
              <p className="text-sm font-medium tracking-wide text-white/70 uppercase">
                OpenClinic AI Receptionist
              </p>
              <h2 className="text-2xl font-semibold text-white">
                {statusText}
              </h2>
            </div>

            <CallOrb mode={mode} level={micLevel} size={220} />

            {/* Captions */}
            {transcript.length > 0 && (
              <div className="flex max-h-40 w-full max-w-md flex-col gap-2 overflow-y-auto px-1 text-left">
                {transcript.map((line) => (
                  <div
                    key={line.id}
                    className={cn(
                      "flex flex-col",
                      line.role === "user" ? "items-end" : "items-start",
                    )}
                  >
                    <span className="mb-0.5 text-[10px] font-medium tracking-wide text-white/40 uppercase">
                      {line.role === "user" ? "You" : "Agent"}
                    </span>
                    <span
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                        line.role === "user"
                          ? "bg-white/15 text-white"
                          : "bg-brand-gradient text-white",
                      )}
                    >
                      {line.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Speaker indicator */}
            <div className="flex items-center gap-3 text-sm text-white/80">
              <span
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1 transition-colors",
                  mode === "userSpeaking"
                    ? "bg-white/15 text-white"
                    : "text-white/50",
                )}
              >
                <span className="size-2 rounded-full bg-accent-sky" />
                You
              </span>
              <span
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1 transition-colors",
                  mode === "agentSpeaking"
                    ? "bg-white/15 text-white"
                    : "text-white/50",
                )}
              >
                <span className="size-2 rounded-full bg-brand-pink" />
                Agent
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
                className={cn(
                  "flex size-14 items-center justify-center rounded-full border text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                  muted
                    ? "border-transparent bg-white/90 text-foreground"
                    : "border-white/30 bg-white/10 hover:bg-white/20",
                )}
              >
                {muted ? (
                  <MicOff className="size-6" />
                ) : (
                  <Mic className="size-6" />
                )}
              </button>

              <button
                type="button"
                onClick={endCall}
                aria-label="End call"
                className="flex size-16 items-center justify-center rounded-full bg-destructive text-white shadow-soft-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <PhoneOff className="size-7" />
              </button>
            </div>

            <p className="text-xs text-white/50">
              Speak naturally — pause when you&apos;re done and the AI will
              reply.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
