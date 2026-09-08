import { Settings } from "lucide-react";

import { ComingSoon } from "@/components/coming-soon";

export default function SettingsPage() {
  return (
    <ComingSoon
      title="系统设置"
      description="配置医院基本信息、服务时间与系统偏好。"
      icon={Settings}
      emptyDescription="医院信息、服务时间、通知与外部服务配置将在这里集中管理。"
    />
  );
}
