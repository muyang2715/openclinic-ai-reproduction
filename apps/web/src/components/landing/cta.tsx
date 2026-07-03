"use client";

import Link from "next/link";
import { ArrowRight, Mic } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

function CTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal variant="scale">
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-16 text-center shadow-soft-lg sm:px-12 sm:py-20">
            {/* Soft texture */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-20"
            >
              <div className="absolute -top-16 -left-10 size-72 rounded-full bg-white/30 blur-3xl" />
              <div className="absolute -right-10 -bottom-16 size-72 rounded-full bg-white/20 blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to modernize your clinic?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">
                Start exploring OpenClinic AI today — the AI front desk that
                never sleeps.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary shadow-soft-md transition-transform hover:scale-[1.03] hover:bg-white/90"
                >
                  <a href="#voice-demo">
                    <Mic className="size-4" />
                    Start Voice Demo
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-transparent text-white transition-transform hover:scale-[1.03] hover:bg-white/10 hover:text-white"
                >
                  <Link href="/dashboard">
                    Explore Dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export { CTA };
