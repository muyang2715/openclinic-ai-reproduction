import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

type ComingSoonProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ComingSoon({
  title,
  description,
  icon,
  emptyTitle,
  emptyDescription,
}: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={<Badge variant="info">即将上线</Badge>}
      />
      <EmptyState
        icon={icon}
        title={emptyTitle ?? `${title} is on the way`}
        description={emptyDescription ?? "我们正在完善这一模块，敬请稍后查看。"}
      />
    </div>
  );
}
