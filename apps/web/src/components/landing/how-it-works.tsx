"use client";

import { motion } from "framer-motion";
import {
  AudioLines,
  Bot,
  Database,
  Mic,
  Volume2,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { SectionHeading } from "./section-heading";

const STEPS: {
  title: string;
  detail: string;
  icon: LucideIcon;
}[] = [
  { title: "患者表达", detail: "患者通过语音或文字提出需求", icon: Mic },
  {
    title: "实时转写",
    detail: "将语音准确转换为可理解的内容",
    icon: AudioLines,
  },
  { title: "智能分诊", detail: "识别意图并交给对应的 Agent", icon: Workflow },
  { title: "业务执行", detail: "完成咨询、预约或急症提醒", icon: Bot },
  { title: "医疗数据", detail: "与医生、排班和预约数据协同", icon: Database },
  { title: "清晰回应", detail: "以自然语言与语音返回结果", icon: Volume2 },
];

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-secondary/40 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="工作流程"
          title="每一次患者请求都清晰可追溯"
          description="从理解需求、智能分流到业务执行，系统始终保留明确的状态与边界。"
        />

        <div className="relative mt-16">
          {/* Glowing connecting line (desktop) */}
          <div className="absolute top-9 right-0 left-0 hidden lg:block">
            <div className="mx-auto h-0.5 max-w-[88%] overflow-hidden rounded-full bg-border">
              <motion.div
                className="h-full bg-brand-gradient"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
                style={{ transformOrigin: "left" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: i * 0.12 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <span className="relative z-10 flex size-[72px] items-center justify-center rounded-2xl border border-border bg-card shadow-soft-md">
                    <span className="absolute inset-0 rounded-2xl bg-brand-gradient opacity-0 blur-md transition-opacity" />
                    <Icon className="size-7 text-primary" strokeWidth={2} />
                    <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-brand-gradient text-[11px] font-bold text-white shadow-soft">
                      {i + 1}
                    </span>
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {step.detail}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Outcome */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mt-12 flex w-fit items-center gap-3 rounded-full border border-border bg-card px-5 py-2.5 shadow-soft"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-brand-gradient text-white">
              <Volume2 className="size-4" />
            </span>
            <span className="text-sm font-medium text-foreground">
              患者得到清晰、准确、负责任的回应
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export { HowItWorks };
