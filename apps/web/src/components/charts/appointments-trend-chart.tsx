"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthPoint } from "@/types/analytics";

export function AppointmentsTrendChart({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eceef3" vertical={false} />
        <XAxis
          dataKey="month"
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
          cursor={{ stroke: "#ec4899", strokeWidth: 1, strokeDasharray: "4 4" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #eceef3",
            boxShadow: "0 12px 32px rgba(17,24,39,0.08)",
            fontSize: 13,
          }}
          labelStyle={{ color: "#111827", fontWeight: 600 }}
        />
        <Line
          type="monotone"
          dataKey="count"
          name="appointments"
          stroke="#ec4899"
          strokeWidth={2.5}
          dot={{ r: 3, strokeWidth: 0, fill: "#ec4899" }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
