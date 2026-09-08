"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUploadDocument } from "@/hooks/useKnowledgeBase";

const ACCEPT = ".pdf,.docx,.txt,.md";
const MAX_BYTES = 10 * 1024 * 1024; // mirrors the API limit
const ALLOWED_EXT = ["pdf", "docx", "txt", "md"];

export function UploadCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const upload = useUploadDocument();

  function handleFile(file: File | undefined) {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.includes(ext)) {
      // Surface client-side; server also validates.
      toast.error("仅支持 PDF、DOCX、TXT 和 MD 文件。");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("文件过大，最大支持 10 MB。");
      return;
    }
    upload.mutate(file, {
      onSettled: () => {
        if (inputRef.current) inputRef.current.value = "";
      },
    });
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div
          role="button"
          tabIndex={0}
          onClick={() => !upload.isPending && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !upload.isPending) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!upload.isPending) handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragging
              ? "border-primary bg-accent/60"
              : "border-border bg-background hover:border-primary/40 hover:bg-secondary/50",
            upload.isPending && "pointer-events-none opacity-70",
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-soft-md">
            {upload.isPending ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <UploadCloud className="size-6" />
            )}
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {upload.isPending
                ? "正在处理并建立文档向量…"
                : "拖放文档到这里，或点击选择文件"}
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOCX, TXT, or MD — up to 10 MB
            </p>
          </div>
          {!upload.isPending && (
            <Button type="button" variant="outline" size="sm" tabIndex={-1}>
              <FileUp className="size-4" />
              Choose file
            </Button>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </CardContent>
    </Card>
  );
}
