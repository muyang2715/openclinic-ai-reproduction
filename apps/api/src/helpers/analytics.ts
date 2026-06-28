type TimeRow = { startTime: Date; endTime: Date };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Appointments per day across the last `days` calendar days (oldest → newest). */
export function bucketByDay(
  rows: { startTime: Date }[],
  days = 7,
): { day: string; appointments: number }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets = Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - i));
    return { key: date.toDateString(), day: WEEKDAYS[date.getDay()]!, appointments: 0 };
  });
  const index = new Map(buckets.map((b, i) => [b.key, i]));

  for (const row of rows) {
    const key = new Date(row.startTime).toDateString();
    const i = index.get(key);
    if (i !== undefined) buckets[i]!.appointments += 1;
  }

  return buckets.map(({ day, appointments }) => ({ day, appointments }));
}

/** Appointments per month across the last `months` months (oldest → newest). */
export function bucketByMonth(
  rows: { startTime: Date }[],
  months = 6,
): { month: string; count: number }[] {
  const now = new Date();
  const buckets = Array.from({ length: months }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: MONTHS[date.getMonth()]!,
      count: 0,
    };
  });
  const index = new Map(buckets.map((b, i) => [b.key, i]));

  for (const row of rows) {
    const d = new Date(row.startTime);
    const i = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) buckets[i]!.count += 1;
  }

  return buckets.map(({ month, count }) => ({ month, count }));
}

/** Average appointment duration in whole minutes (0 when there are none). */
export function averageMinutes(rows: TimeRow[]): number {
  if (rows.length === 0) return 0;
  const total = rows.reduce(
    (sum, r) =>
      sum + (new Date(r.endTime).getTime() - new Date(r.startTime).getTime()),
    0,
  );
  return Math.round(total / rows.length / 60000);
}
