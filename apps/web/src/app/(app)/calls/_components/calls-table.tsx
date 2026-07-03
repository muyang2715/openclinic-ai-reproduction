"use client";

import { PhoneCall, User } from "lucide-react";

import { formatDate, formatTime } from "@/lib/datetime";
import type { CallSummary } from "@/types/call";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CallStatusBadge, formatDuration } from "./call-status-badge";

type CallsTableProps = {
  calls: CallSummary[];
  onSelect: (call: CallSummary) => void;
};

export function CallsTable({ calls, onSelect }: CallsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Caller</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Turns</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow
              key={call.id}
              className="cursor-pointer"
              onClick={() => onSelect(call)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    {call.patientName ? (
                      <User className="size-4" />
                    ) : (
                      <PhoneCall className="size-4" />
                    )}
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {call.patientName ?? "Unknown caller"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(call.startedAt)} · {formatTime(call.startedAt)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDuration(call.durationSec)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {call.userTurns}
              </TableCell>
              <TableCell>
                <CallStatusBadge status={call.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
