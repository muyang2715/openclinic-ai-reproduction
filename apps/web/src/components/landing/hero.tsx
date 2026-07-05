"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, LogIn, Mic, Sparkles } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useCall } from "@/hooks/useCall";
import { HeroDashboardMock } from "./hero-dashboard-mock";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

function Hero() {
  const reduceMotion = useReducedMotion();
  const { openForm } = useCall();
  const { data: session } = authClient.useSession();
  const item = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] as const },
    },
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-brand-gradient opacity-[0.07] blur-3xl" />
        <div className="absolute top-40 -right-20 size-80 rounded-full bg-accent-sky/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8">
        <motion.div variants={container} initial="hidden" animate="visible">
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground shadow-soft">
              <Sparkles className="size-3.5 text-primary" />
              AI Receptionist Platform
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-4xl leading-[1.08] font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            AI Receptionist for{" "}
            <span className="text-brand-gradient">Modern Healthcare</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Automate patient conversations, appointment scheduling, and clinic
            operations with a production-ready AI platform powered by LangGraph,
            Deepgram, and ElevenLabs.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              variant="gradient"
              size="lg"
              onClick={openForm}
              className="transition-transform hover:scale-[1.03]"
            >
              <Mic className="size-4" />
              Start Voice Demo
            </Button>
            {session ? (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="transition-transform hover:scale-[1.03]"
              >
                <Link href="/dashboard">
                  View Dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="transition-transform hover:scale-[1.03]"
              >
                <Link href="/sign-in">
                  <LogIn className="size-4" />
                  Login
                </Link>
              </Button>
            )}
          </motion.div>

          <motion.div
            variants={item}
            className="mt-8 flex items-center gap-6 text-xs text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success" />
              Multi-agent voice AI
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success" />
              24/7 availability
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success" />
              &lt;500ms response
            </span>
          </motion.div>
        </motion.div>

        <div className="lg:pl-6">
          <HeroDashboardMock />
        </div>
      </div>
    </section>
  );
}

export { Hero };
