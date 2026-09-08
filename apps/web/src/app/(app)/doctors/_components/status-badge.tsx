import { Badge } from "@/components/ui/badge";

export function DoctorStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "success" : "default"}>
      <span className="size-1.5 rounded-full bg-current" />
      {isActive ? "在岗" : "停诊"}
    </Badge>
  );
}
