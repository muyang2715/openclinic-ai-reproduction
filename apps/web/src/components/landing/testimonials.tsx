"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SectionHeading } from "./section-heading";

const TESTIMONIALS = [
  {
    quote:
      "Our front desk used to drown in calls. OpenClinic AI now handles scheduling overnight — patients book while we sleep.",
    name: "Dr. Sarah Lin",
    role: "Clinic Director, Lin Cardiology",
  },
  {
    quote:
      "The multi-agent setup is genuinely smart. It knows when to book, when to answer, and when to hand off to my staff.",
    name: "Amir Khan",
    role: "Operations Lead, BrightCare",
  },
  {
    quote:
      "Setup was painless and the voice quality is uncanny. Patients regularly think they're talking to a real receptionist.",
    name: "Mia Torres",
    role: "Practice Manager, Torres Family Health",
  },
];

function Testimonials() {
  return (
    <section id="testimonials" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Loved by clinics"
          title="Trusted by modern practices"
          description="Teams that switched to an AI front desk — and never looked back."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className="size-4 fill-warning text-warning"
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-brand-gradient text-white">
                    {t.name
                      .replace(/^Dr\.?\s+/, "")
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Testimonials };
