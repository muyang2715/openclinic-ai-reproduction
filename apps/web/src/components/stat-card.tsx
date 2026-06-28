import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label?: string };
  className?: string;
};

function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  const isPositive = (trend?.value ?? 0) >= 0;
  return (
    <Card className={cn("gap-0 p-6", className)}>
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
      </div>
      <div className="mt-4 flex items-end gap-2.5">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "mb-1 inline-flex items-center gap-0.5 text-xs font-medium",
              isPositive ? "text-success" : "text-destructive",
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {trend?.label && (
        <span className="mt-1 text-xs text-muted-foreground">{trend.label}</span>
      )}
    </Card>
  );
}

export { StatCard };
