"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DayPoint } from "@/types/analytics";

export function WeeklyAppointmentsChart({ data }: { data: DayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eceef3" vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#6b7280", fontSize: 12 }}
          dy={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#6b7280", fontSize: 12 }}
          width={40}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ stroke: "#7c3aed", strokeWidth: 1, strokeDasharray: "4 4" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #eceef3",
            boxShadow: "0 12px 32px rgba(17,24,39,0.08)",
            fontSize: 13,
          }}
          labelStyle={{ color: "#111827", fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="appointments"
          stroke="#7c3aed"
          strokeWidth={2.5}
          fill="url(#weeklyFill)"
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
