import { Settings } from "lucide-react";

import { ComingSoon } from "@/components/coming-soon";

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Configure your clinic, hours, and preferences."
      icon={Settings}
      emptyDescription="Clinic information, business hours, notifications, and integrations will live here."
    />
  );
}
