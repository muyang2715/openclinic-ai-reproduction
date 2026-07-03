"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  Lock,
  PhoneCall,
  Stethoscope,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { VoiceOrb } from "./voice-orb";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "doctors", label: "Doctors", icon: Stethoscope },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "calls", label: "Calls", icon: PhoneCall },
  { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Bar({ h, accent }: { h: number; accent?: boolean }) {
  return (
    <div
      className={cn(
        "flex-1 rounded-t-md",
        accent ? "bg-brand-gradient" : "bg-secondary",
      )}
      style={{ height: `${h}%` }}
    />
  );
}

function ListRows({
  rows,
  withStatus,
}: {
  rows: { a: string; b: string; tag?: string }[];
  withStatus?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
            {row.a
              .replace(/^Dr\.?\s+/, "")
              .split(" ")
              .map((w) => w[0])
              .join("")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {row.a}
            </p>
            <p className="truncate text-xs text-muted-foreground">{row.b}</p>
          </div>
          {withStatus && row.tag && (
            <Badge variant="success" className="shrink-0">
              {row.tag}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}

function TabPanel({ tab }: { tab: TabId }) {
  if (tab === "dashboard") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4 sm:col-span-2">
          <p className="text-xs font-medium text-muted-foreground">
            Weekly appointments
          </p>
          <div className="mt-4 flex h-32 items-end gap-2">
            {[40, 62, 48, 78, 55, 90, 70].map((h, i) => (
              <Bar key={i} h={h} accent={i === 5} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { label: "Doctors", value: "24" },
            { label: "Today", value: "38" },
            { label: "Resolved by AI", value: "95%" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {kpi.value}
              </p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === "doctors") {
    return (
      <ListRows
        withStatus
        rows={[
          { a: "Dr. Sarah Lin", b: "Cardiology · Room 204", tag: "Available" },
          { a: "Dr. Amir Khan", b: "Pediatrics · Room 110", tag: "On duty" },
          { a: "Dr. Mia Torres", b: "Dermatology · Room 302", tag: "Available" },
          { a: "Dr. James Park", b: "Neurology · Room 215", tag: "On duty" },
        ]}
      />
    );
  }

  if (tab === "appointments") {
    return (
      <ListRows
        withStatus
        rows={[
          { a: "Emma Wilson", b: "Dr. Sarah Lin · 09:30 AM", tag: "Booked" },
          { a: "Liam Brown", b: "Dr. Amir Khan · 10:15 AM", tag: "Booked" },
          { a: "Olivia Davis", b: "Dr. Mia Torres · 11:00 AM", tag: "Booked" },
          { a: "Noah Martin", b: "Dr. James Park · 01:45 PM", tag: "Booked" },
        ]}
      />
    );
  }

  if (tab === "calls") {
    return (
      <div className="flex flex-col gap-3">
        {[
          { who: "Inbound · +1 (415) 555-0132", sum: "Booked a cardiology visit", dur: "1:24" },
          { who: "Inbound · +1 (628) 555-0190", sum: "Rescheduled appointment", dur: "0:58" },
          { who: "Inbound · +1 (510) 555-0177", sum: "Asked about opening hours", dur: "0:41" },
        ].map((call, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-3"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-brand-gradient text-white">
              <PhoneCall className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {call.who}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {call.sum}
              </p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {call.dur}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {[
        { q: "What are your opening hours?", a: "Mon–Fri, 8 AM – 6 PM" },
        { q: "Do you accept walk-ins?", a: "Yes, subject to availability" },
        { q: "Which insurance do you take?", a: "Most major providers" },
      ].map((row, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-surface px-4 py-3"
        >
          <p className="text-sm font-medium text-foreground">{row.q}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="text-primary">RAG ·</span> {row.a}
          </p>
        </div>
      ))}
    </div>
  );
}

function ProductDemo() {
  const [tab, setTab] = useState<TabId>("dashboard");

  return (
    <section id="voice-demo" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Product"
          title="See OpenClinic AI in action"
          description="One clean console for your team — while the AI handles the front desk."
        />

        <Reveal variant="scale" className="mt-14">
          <div className="relative mx-auto max-w-5xl">
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 rounded-[28px] bg-brand-gradient opacity-10 blur-3xl"
            />

            {/* Browser chrome */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft-lg">
              <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
                <span className="size-3 rounded-full bg-destructive/70" />
                <span className="size-3 rounded-full bg-warning/70" />
                <span className="size-3 rounded-full bg-success/70" />
                <div className="mx-auto flex items-center gap-2 rounded-md bg-secondary px-3 py-1 text-xs text-muted-foreground">
                  <Lock className="size-3" />
                  app.openclinic.ai/{tab}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr]">
                {/* Sidebar */}
                <div className="hidden flex-col gap-1 border-r border-border bg-surface p-3 sm:flex">
                  {TABS.map((t) => {
                    const Icon = t.icon;
                    const active = t.id === tab;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                          active
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-4",
                            active ? "text-primary" : "",
                          )}
                        />
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile tabs */}
                <div className="flex gap-1 overflow-x-auto border-b border-border bg-surface p-2 sm:hidden">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={cn(
                        "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                        t.id === tab
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Panel */}
                <div className="bg-background p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {TABS.find((t) => t.id === tab)?.label}
                    </p>
                    <Badge variant="info">Live</Badge>
                  </div>
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabPanel tab={tab} />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Floating voice assistant */}
            <div className="absolute -bottom-10 right-4 z-20 flex items-center gap-3 rounded-2xl border border-border bg-surface/90 p-3 pr-5 shadow-soft-lg backdrop-blur sm:right-8">
              <VoiceOrb size={88} />
              <div className="hidden sm:block">
                <Badge variant="brand">
                  <BarChart3 className="size-3" />
                  Live demo coming soon
                </Badge>
                <p className="mt-1.5 max-w-[10rem] text-xs text-muted-foreground">
                  The voice assistant arrives in Phase 2.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export { ProductDemo };
