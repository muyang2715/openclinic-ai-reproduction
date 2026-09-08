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
    title: "智能语音接待",
    description: "实时理解患者表达，以自然语音完成咨询与引导。",
    icon: Mic,
  },
  {
    title: "多 Agent 分流",
    description: "监督 Agent 将每一次来访交给最合适的专科流程。",
    icon: Network,
  },
  {
    title: "预约自动化",
    description: "查询医生、识别冲突，并稳妥完成预约安排。",
    icon: CalendarCheck,
  },
  {
    title: "医疗知识库",
    description: "基于院内文档回答服务、流程与就诊问题。",
    icon: BookOpen,
  },
  {
    title: "服务分析",
    description: "沉淀转写、摘要与通话记录，持续改善患者体验。",
    icon: BarChart3,
  },
  {
    title: "人工协同",
    description: "遇到复杂情况时，为医护团队保留清晰的接管入口。",
    icon: UserCog,
  },
];

function Features() {
  return (
    <section id="features" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="核心能力"
          title="一套稳健的医疗前台系统"
          description="从第一声来电到预约落库，让患者服务有回应、有记录、有边界。"
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
