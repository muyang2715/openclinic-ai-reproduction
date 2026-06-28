import Link from "next/link";
import { Activity } from "lucide-react";

import { cn } from "@/lib/utils";

function Logo({
  className,
  href = "/dashboard",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2.5", className)}
      aria-label="OpenClinic AI home"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-brand-gradient shadow-soft-md">
        <Activity className="size-5 text-white" strokeWidth={2.25} />
      </span>
      <span className="text-[1.05rem] font-bold tracking-tight text-foreground">
        OpenClinic
        <span className="text-brand-gradient"> AI</span>
      </span>
    </Link>
  );
}

export { Logo };
