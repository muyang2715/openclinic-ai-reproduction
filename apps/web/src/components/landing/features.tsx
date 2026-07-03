"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  Mic,
  Network,
  UserCog,
  type LucideIcon,
} from "lucide-react";

import { SectionHeading } from "./section-heading";

const FEATURES: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Voice AI",
    description: "Real-time speech conversations with natural AI voices.",
    icon: Mic,
  },
  {
    title: "Multi-Agent System",
    description: "A supervisor agent intelligently routes every conversation.",
    icon: Network,
  },
  {
    title: "Appointment Automation",
    description: "Book, cancel, and reschedule appointments hands-free.",
    icon: CalendarCheck,
  },
  {
    title: "Knowledge Base",
    description: "Answer clinic questions instantly using RAG.",
    icon: BookOpen,
  },
  {
    title: "Conversation Analytics",
    description: "Store transcripts, summaries, and call recordings.",
    icon: BarChart3,
  },
  {
    title: "Human Handoff",
    description: "Transfer conversations to clinic staff when needed.",
    icon: UserCog,
  },
];

function Features() {
  return (
    <section id="features" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Capabilities"
          title="Everything a modern clinic needs"
          description="A complete AI front desk — from the first ring to the booked appointment."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                whileHover={{ y: -6 }}
                className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-soft-lg"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-soft-md">
                  <Icon className="size-6" strokeWidth={2} />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { Features };
