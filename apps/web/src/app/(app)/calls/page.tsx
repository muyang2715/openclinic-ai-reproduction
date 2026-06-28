import { PhoneCall } from "lucide-react";

import { ComingSoon } from "@/components/coming-soon";

export default function CallsPage() {
  return (
    <ComingSoon
      title="Calls"
      description="Review call history, recordings, and summaries."
      icon={PhoneCall}
      emptyDescription="Call logs and transcripts will appear here once voice features go live."
    />
  );
}
