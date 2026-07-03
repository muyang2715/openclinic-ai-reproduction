import { Badge } from "@/components/ui/badge";
import type { CallStatus } from "@/types/call";

const STATUS: Record<
  CallStatus,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  COMPLETED: { label: "Completed", variant: "success" },
  NO_AUDIO: { label: "No audio", variant: "warning" },
  FAILED: { label: "Failed", variant: "destructive" },
};

export function CallStatusBadge({ status }: { status: CallStatus }) {
  const config = STATUS[status] ?? { label: status, variant: "warning" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Seconds -> "m:ss" (e.g. 75 -> "1:15").
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
