import type { Metadata } from "next";

import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { TechStack } from "@/components/landing/tech-stack";
import { Features } from "@/components/landing/features";
import { ProductDemo } from "@/components/landing/product-demo";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Stats } from "@/components/landing/stats";
import { Testimonials } from "@/components/landing/testimonials";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { CallProvider } from "@/context/call-provider";
import { CallFab } from "@/components/call/call-fab";
import { CallOverlay } from "@/components/call/call-overlay";
import { PreCallDialog } from "@/components/call/pre-call-dialog";

export const metadata: Metadata = {
  title: "OpenClinic AI — AI Receptionist for Modern Healthcare",
  description:
    "Automate patient conversations, appointment scheduling, and clinic workflows with a production-ready AI platform powered by Voice AI and multi-agent systems.",
};

export default function LandingPage() {
  return (
    <CallProvider>
      <div className="min-h-screen bg-background">
        <LandingNav />
        <main>
          <Hero />
          <TechStack />
          <Features />
          <ProductDemo />
          <HowItWorks />
          <Stats />
          <Testimonials />
          <CTA />
        </main>
        <Footer />
      </div>
      <PreCallDialog />
      <CallFab />
      <CallOverlay />
    </CallProvider>
  );
}
