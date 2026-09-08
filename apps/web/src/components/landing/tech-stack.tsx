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
  { name: "Next.js", description: "现代化管理端界面", icon: Triangle },
  { name: "Express", description: "稳定的业务 API", icon: Server },
  { name: "TypeScript", description: "端到端类型安全", icon: Braces },
  { name: "LangGraph", description: "多 Agent 工作流编排", icon: Workflow },
  { name: "LangChain", description: "模型工具与知识库", icon: Link2 },
  { name: "Deepgram", description: "实时语音转写", icon: AudioLines },
  { name: "ElevenLabs", description: "自然语音播报", icon: Volume2 },
  { name: "PostgreSQL", description: "医疗业务数据存储", icon: Database },
  { name: "Prisma", description: "类型安全的数据访问", icon: Boxes },
  { name: "AWS S3", description: "通话记录与文件", icon: Cloud },
  { name: "AWS EC2", description: "服务运行环境", icon: Cpu },
  { name: "GitHub Actions", description: "持续集成与交付", icon: GitBranch },
];

function TechStack() {
  return (
    <section id="tech" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="技术架构"
          title="稳健、清晰、可持续演进"
          description="以成熟的 Web、Agent、数据与语音组件构成医疗服务基础设施。"
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
