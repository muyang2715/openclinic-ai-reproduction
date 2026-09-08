import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/types/appointment";

const config: Record<
  AppointmentStatus,
  { label: string; variant: "info" | "success" | "destructive" | "warning" }
> = {
  BOOKED: { label: "已预约", variant: "info" },
  COMPLETED: { label: "已完成", variant: "success" },
  CANCELLED: { label: "已取消", variant: "destructive" },
  RESCHEDULED: { label: "已改期", variant: "warning" },
};

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "BOOKED",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED",
];

export function appointmentStatusLabel(status: AppointmentStatus) {
  return config[status].label;
}

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  const { label, variant } = config[status];
  return (
    <Badge variant={variant}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}
