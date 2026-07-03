"use client";

import { Loader2, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDate, formatTime } from "@/lib/datetime";
import { useCallDetail } from "@/hooks/useCalls";
import type { CallSummary } from "@/types/call";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CallStatusBadge, formatDuration } from "./call-status-badge";

type CallDetailDialogProps = {
  call: CallSummary | null;
  onClose: () => void;
};

export function CallDetailDialog({ call, onClose }: CallDetailDialogProps) {
  const { data, isPending, isError } = useCallDetail(call?.id ?? null);

  return (
    <Dialog open={call !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {call?.patientName ?? "Unknown caller"}
            {call && <CallStatusBadge status={call.status} />}
          </DialogTitle>
          <DialogDescription>
            {call && (
              <>
                {formatDate(call.startedAt)} · {formatTime(call.startedAt)} ·{" "}
                {formatDuration(call.durationSec)} · {call.userTurns} turns
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : isError || !data ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <TriangleAlert className="size-6 text-destructive" />
            <p className="text-sm">Couldn&apos;t load this call.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.audioUrl ? (
              <audio controls src={data.audioUrl} className="w-full">
                Your browser does not support audio playback.
              </audio>
            ) : (
              <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                No recording is available for this call.
              </p>
            )}

            <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
              {data.transcript.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No transcript captured.
                </p>
              ) : (
                data.transcript.map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col",
                      line.role === "user" ? "items-end" : "items-start",
                    )}
                  >
                    <span className="mb-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                      {line.role === "user" ? "Caller" : "Agent"}
                    </span>
                    <span
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                        line.role === "user"
                          ? "bg-accent text-foreground"
                          : "bg-brand-gradient text-white",
                      )}
                    >
                      {line.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
