import { BookOpen } from "lucide-react";

import { ComingSoon } from "@/components/coming-soon";

export default function KnowledgeBasePage() {
  return (
    <ComingSoon
      title="Knowledge Base"
      description="Upload and organize documents for your clinic."
      icon={BookOpen}
      emptyDescription="Document upload, categories, and search will power the AI knowledge base soon."
    />
  );
}
