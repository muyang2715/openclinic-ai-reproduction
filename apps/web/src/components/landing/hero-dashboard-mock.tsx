"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Clock, Stethoscope, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { VoiceOrb } from "./voice-orb";

const KPIS = [
  { label: "Doctors", value: "24", icon: Stethoscope, tint: "text-brand" },
  { label: "Patients", value: "1,204", icon: Users, tint: "text-brand-pink" },
  { label: "Today", value: "38", icon: CalendarDays, tint: "text-accent-sky" },
  { label: "Upcoming", value: "12", icon: Clock, tint: "text-success" },
];

const BARS = [42, 58, 36, 72, 50, 88, 64];

const ROWS = [
  { name: "Dr. Sarah Lin", role: "Cardiology", status: "Available" },
  { name: "Dr. Amir Khan", role: "Pediatrics", status: "In session" },
  { name: "Dr. Mia Torres", role: "Dermatology", status: "Available" },
];

function HeroDashboardMock() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative">
      {/* Glow behind */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[32px] bg-brand-gradient opacity-20 blur-3xl"
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="rounded-2xl border border-border bg-card p-4 shadow-soft-lg sm:p-5"
      >
        {/* Browser chrome */}
        <div className="mb-4 flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive/70" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-success/70" />
          <div className="ml-3 h-6 flex-1 rounded-md bg-secondary" />
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {KPIS.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="rounded-xl border border-border bg-surface p-3"
              >
                <Icon className={cn("size-4", kpi.tint)} strokeWidth={2.25} />
                <p className="mt-2 text-lg font-bold tracking-tight text-foreground">
                  {kpi.value}
                </p>
                <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
              </div>
            );
          })}
        </div>

        {/* Chart + list */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-border bg-surface p-4 sm:col-span-3">
            <p className="text-xs font-medium text-muted-foreground">
              Weekly appointments
            </p>
            <div className="mt-4 flex h-28 items-end gap-2">
              {BARS.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-md bg-brand-gradient"
                  initial={reduceMotion ? false : { height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + i * 0.07,
                    ease: "easeOut",
                  }}
                  style={{ opacity: 0.55 + (h / 100) * 0.45 }}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3 sm:col-span-2">
            <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">
              Doctors
            </p>
            <div className="flex flex-col gap-1">
              {ROWS.map((row) => (
                <div
                  key={row.name}
                  className="flex items-center gap-2.5 rounded-lg px-1 py-1.5"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
                    {row.name
                      .replace(/^Dr\.?\s+/, "")
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {row.name}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {row.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating voice orb */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute -bottom-8 -left-6 z-20 rounded-2xl border border-border bg-surface/90 p-3 shadow-soft-lg backdrop-blur sm:-left-10"
      >
        <VoiceOrb size={104} />
      </motion.div>

      {/* Floating mini badge */}
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-5 -right-3 z-20 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-soft-md sm:-right-6"
      >
        <span className="flex size-7 items-center justify-center rounded-lg bg-success/12">
          <CalendarDays className="size-3.5 text-success" />
        </span>
        <div>
          <p className="text-[11px] font-semibold text-foreground">
            Appointment booked
          </p>
          <p className="text-[10px] text-muted-foreground">by AI · just now</p>
        </div>
      </motion.div>
    </div>
  );
}

export { HeroDashboardMock };
