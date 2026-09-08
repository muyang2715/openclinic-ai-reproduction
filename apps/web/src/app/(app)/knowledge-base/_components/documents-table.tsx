"use client";

import { useState } from "react";
import { FileText, Trash2 } from "lucide-react";

import { cn, formatBytes } from "@/lib/utils";
import { formatDate } from "@/lib/datetime";
import type { KbDocument } from "@/types/knowledgeBase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentStatusBadge, DocumentTypeBadge } from "./document-type-badge";

type DocumentsTableProps = {
  documents: KbDocument[];
  onDelete: (document: KbDocument) => void;
  isDeleting?: boolean;
};

export function DocumentsTable({
  documents,
  onDelete,
  isDeleting,
}: DocumentsTableProps) {
  const [pendingDelete, setPendingDelete] = useState<KbDocument | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>文档</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>大小</TableHead>
            <TableHead>分块</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>上传时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    <FileText className="size-4" />
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {document.fileName}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <DocumentTypeBadge type={document.fileType} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatBytes(document.fileSize)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {document.chunkCount}
              </TableCell>
              <TableCell>
                <DocumentStatusBadge status={document.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(document.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "size-8 text-muted-foreground hover:text-destructive",
                  )}
                  aria-label={`删除 ${document.fileName}`}
                  onClick={() => setPendingDelete(document)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除文档</DialogTitle>
            <DialogDescription>
              确定删除文档{" "}
              <span className="font-medium text-foreground">
                {pendingDelete?.fileName}
              </span>
              吗？这会同时移除知识库中的向量，且无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => {
                if (pendingDelete) onDelete(pendingDelete);
                setPendingDelete(null);
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
