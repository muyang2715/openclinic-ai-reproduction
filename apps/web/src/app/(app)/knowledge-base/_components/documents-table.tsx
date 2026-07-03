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
import {
  DocumentStatusBadge,
  DocumentTypeBadge,
} from "./document-type-badge";

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
            <TableHead>Document</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Chunks</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                  className={cn("size-8 text-muted-foreground hover:text-destructive")}
                  aria-label={`Delete ${document.fileName}`}
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
            <DialogTitle>Delete document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {pendingDelete?.fileName}
              </span>
              ? This removes its embeddings from the knowledge base and cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => {
                if (pendingDelete) onDelete(pendingDelete);
                setPendingDelete(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
