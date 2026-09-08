"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

const LINKS = [
  { label: "核心能力", href: "#features" },
  { label: "工作流程", href: "#how-it-works" },
  { label: "技术架构", href: "#tech" },
  { label: "客户评价", href: "#testimonials" },
];

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-surface/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo href="/" />

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            {session ? (
              <Link href="/dashboard">进入工作台</Link>
            ) : (
              <Link href="/sign-in">管理端登录</Link>
            )}
          </Button>
          <Button asChild variant="gradient" size="sm">
            <a href="#voice-demo">体验智能前台</a>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary md:hidden"
          aria-label={open ? "关闭菜单" : "打开菜单"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Button asChild variant="outline">
                {session ? (
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    进入工作台
                  </Link>
                ) : (
                  <Link href="/sign-in" onClick={() => setOpen(false)}>
                    管理端登录
                  </Link>
                )}
              </Button>
              <Button asChild variant="gradient">
                <a href="#voice-demo" onClick={() => setOpen(false)}>
                  体验智能前台
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export { LandingNav };
