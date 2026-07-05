"use client";

import { motion } from "framer-motion";
import {
  AudioLines,
  Boxes,
  Braces,
  Cloud,
  Cpu,
  Database,
  GitBranch,
  Link2,
  Server,
  Triangle,
  Volume2,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { SectionHeading } from "./section-heading";

const TECH: { name: string; description: string; icon: LucideIcon }[] = [
  { name: "Next.js", description: "App Router frontend", icon: Triangle },
  { name: "Express", description: "REST API backend", icon: Server },
  { name: "TypeScript", description: "End-to-end type safety", icon: Braces },
  { name: "LangGraph", description: "Multi-agent orchestration", icon: Workflow },
  { name: "LangChain", description: "LLM tooling & RAG", icon: Link2 },
  { name: "Deepgram", description: "Real-time speech-to-text", icon: AudioLines },
  { name: "ElevenLabs", description: "Natural voice synthesis", icon: Volume2 },
  { name: "PostgreSQL", description: "Relational data store", icon: Database },
  { name: "Prisma", description: "Type-safe ORM", icon: Boxes },
  { name: "AWS S3", description: "Recordings & assets", icon: Cloud },
  { name: "AWS EC2", description: "Cloud compute hosting", icon: Cpu },
  { name: "GitHub Actions", description: "CI/CD pipelines", icon: GitBranch },
];

function TechStack() {
  return (
    <section id="tech" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Infrastructure"
          title="Built with Modern AI Infrastructure"
          description="A production-grade stack — the same tools powering today's leading AI products."
        />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {TECH.map((tech, i) => {
            const Icon = tech.icon;
            return (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
                whileHover={{ y: -4 }}
                className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-soft-md"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary transition-colors group-hover:bg-brand-gradient group-hover:text-white">
                  <Icon className="size-5" strokeWidth={2} />
                </span>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  {tech.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tech.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { TechStack };
