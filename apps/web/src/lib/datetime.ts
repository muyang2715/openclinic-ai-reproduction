function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** ISO datetime -> local "yyyy-mm-dd" for <input type="date">. */
export function toDateInput(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** ISO datetime -> local "HH:mm" for <input type="time">. */
export function toTimeInput(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Combine a local date ("yyyy-mm-dd") + time ("HH:mm") into an ISO string. */
export function combineDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString();
}

/** Display helpers (local time). */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
