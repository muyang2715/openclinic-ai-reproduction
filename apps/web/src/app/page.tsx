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
  title: "OpenClinic AI｜智能医疗前台",
  description:
    "面向医院与诊所的智能前台，承接患者咨询、预约管理、知识库问答与急症分流。",
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
