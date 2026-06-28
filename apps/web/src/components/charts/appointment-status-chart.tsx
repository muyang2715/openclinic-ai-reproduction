"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { AppointmentStatus } from "@/types/appointment";
import type { StatusCount } from "@/types/analytics";

const STATUS_META: Record<
  AppointmentStatus,
  { label: string; color: string }
> = {
  BOOKED: { label: "Booked", color: "#38bdf8" },
  COMPLETED: { label: "Completed", color: "#22c55e" },
  CANCELLED: { label: "Cancelled", color: "#ef4444" },
  RESCHEDULED: { label: "Rescheduled", color: "#f59e0b" },
};

export function AppointmentStatusChart({ data }: { data: StatusCount[] }) {
  const slices = data
    .filter((d) => d.count > 0)
    .map((d) => ({
      name: STATUS_META[d.status].label,
      value: d.count,
      color: STATUS_META[d.status].color,
    }));
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
        No appointment data yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={3}
              strokeWidth={0}
            >
              {slices.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #eceef3",
                boxShadow: "0 12px 32px rgba(17,24,39,0.08)",
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>
      <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-1">
        {slices.map((slice) => (
          <li key={slice.name} className="flex items-center gap-2.5">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-sm text-muted-foreground">{slice.name}</span>
            <span className="ml-auto text-sm font-semibold text-foreground">
              {slice.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
