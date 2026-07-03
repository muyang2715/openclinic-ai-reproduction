"use client";

import { useCountUp } from "./use-count-up";
import { Reveal } from "./reveal";

type Stat = {
  target?: number;
  prefix?: string;
  suffix?: string;
  staticValue?: string;
  label: string;
};

const STATS: Stat[] = [
  { target: 10000, suffix: "+", label: "Appointments" },
  { target: 95, suffix: "%", label: "AI Resolution Rate" },
  { staticValue: "24/7", label: "Availability" },
  { target: 500, prefix: "<", suffix: "ms", label: "Avg Response Time" },
];

function StatValue({ stat }: { stat: Stat }) {
  const { ref, value } = useCountUp(stat.target ?? 0);

  return (
    <span
      ref={ref}
      className="text-4xl font-bold tracking-tight text-brand-gradient sm:text-5xl"
    >
      {stat.staticValue ?? (
        <>
          {stat.prefix}
          {value.toLocaleString()}
          {stat.suffix}
        </>
      )}
    </span>
  );
}

function Stats() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-2 gap-6 rounded-3xl border border-border bg-card p-8 shadow-soft lg:grid-cols-4 lg:p-12">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 text-center"
              >
                <StatValue stat={stat} />
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export { Stats };
