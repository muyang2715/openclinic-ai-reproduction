import type { Metadata } from "next";

import { SignInForm } from "./_components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in — OpenClinic AI",
};

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Ambient brand background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-brand-gradient opacity-[0.08] blur-3xl" />
        <div className="absolute bottom-0 -right-20 size-80 rounded-full bg-accent-sky/10 blur-3xl" />
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            OpenClinic <span className="text-brand-gradient">AI</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your clinic dashboard
          </p>
        </div>

        <SignInForm />
      </div>
    </main>
  );
}
