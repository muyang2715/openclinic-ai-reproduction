"use client";

import { useState } from "react";
import { Clock, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";

import type { DayOfWeek, Schedule } from "@/types/doctor";
import { useDeleteSchedule, useSchedules } from "@/hooks/useSchedules";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScheduleDialog } from "./schedule-dialog";

const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

function dayLabel(day: DayOfWeek) {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

export function WorkingHours({ doctorId }: { doctorId: string }) {
  const { data, isPending, isError, refetch } = useSchedules(doctorId);
  const deleteSchedule = useDeleteSchedule(doctorId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Schedule | null>(null);

  const schedules = [...(data ?? [])].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek),
  );

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(schedule: Schedule) {
    setEditing(schedule);
    setDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Working Hours</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Add slot
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <TriangleAlert className="size-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Couldn&apos;t load working hours.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : schedules.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No working hours set"
            description="Add weekly availability slots for this doctor."
            className="border-0 py-10"
            action={
              <Button variant="gradient" size="sm" onClick={openCreate}>
                <Plus className="size-4" />
                Add slot
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col">
            {schedules.map((slot) => (
              <div
                key={slot.id}
                className="group flex items-center justify-between border-b border-border py-2.5 last:border-0"
              >
                <span className="text-sm font-medium text-foreground">
                  {dayLabel(slot.dayOfWeek)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="size-3.5" />
                    {slot.startTime} – {slot.endTime}
                  </span>
                  <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={`Edit ${dayLabel(slot.dayOfWeek)} hours`}
                      onClick={() => openEdit(slot)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      aria-label={`Delete ${dayLabel(slot.dayOfWeek)} hours`}
                      onClick={() => setPendingDelete(slot)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ScheduleDialog
        doctorId={doctorId}
        schedule={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete working hours</DialogTitle>
            <DialogDescription>
              Remove{" "}
              <span className="font-medium text-foreground">
                {pendingDelete && dayLabel(pendingDelete.dayOfWeek)}
              </span>{" "}
              ({pendingDelete?.startTime} – {pendingDelete?.endTime})? This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteSchedule.isPending}
              onClick={() => {
                if (pendingDelete) {
                  deleteSchedule.mutate(pendingDelete.id, {
                    onSuccess: () => setPendingDelete(null),
                  });
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
