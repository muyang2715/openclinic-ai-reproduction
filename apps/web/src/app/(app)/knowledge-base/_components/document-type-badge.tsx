import { Badge } from "@/components/ui/badge";
import type { DocFileType, DocumentStatus } from "@/types/knowledgeBase";

const TYPE_LABEL: Record<DocFileType, string> = {
  pdf: "PDF",
  docx: "DOCX",
  txt: "TXT",
  md: "MD",
};

export function DocumentTypeBadge({ type }: { type: DocFileType }) {
  return (
    <Badge variant="outline">{TYPE_LABEL[type] ?? type.toUpperCase()}</Badge>
  );
}

const STATUS_VARIANT: Record<
  DocumentStatus,
  "success" | "warning" | "destructive"
> = {
  READY: "success",
  PROCESSING: "warning",
  FAILED: "destructive",
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? "default"}>
      {status === "READY"
        ? "已就绪"
        : status === "PROCESSING"
          ? "处理中"
          : "失败"}
    </Badge>
  );
}
