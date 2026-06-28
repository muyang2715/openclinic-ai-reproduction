"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { DayOfWeek, Schedule } from "@/types/doctor";
import { useCreateSchedule, useUpdateSchedule } from "@/hooks/useSchedules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format");

const scheduleFormSchema = z
  .object({
    dayOfWeek: z.enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]),
    startTime: time,
    endTime: time,
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

type ScheduleDialogProps = {
  doctorId: string;
  schedule?: Schedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ScheduleDialog({
  doctorId,
  schedule,
  open,
  onOpenChange,
}: ScheduleDialogProps) {
  const isEdit = Boolean(schedule);
  const createSchedule = useCreateSchedule(doctorId);
  const updateSchedule = useUpdateSchedule(doctorId);

  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "17:00",
    },
  });

  // Sync form values whenever the dialog opens (create vs edit).
  useEffect(() => {
    if (open) {
      reset({
        dayOfWeek: schedule?.dayOfWeek ?? "MONDAY",
        startTime: schedule?.startTime ?? "09:00",
        endTime: schedule?.endTime ?? "17:00",
      });
    }
  }, [open, schedule, reset]);

  const isSubmitting = createSchedule.isPending || updateSchedule.isPending;

  function onSubmit(values: ScheduleFormValues) {
    if (isEdit && schedule) {
      updateSchedule.mutate(
        { id: schedule.id, input: values },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createSchedule.mutate(
        { doctorId, ...values },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit working hours" : "Add working hours"}</DialogTitle>
          <DialogDescription>
            Set the day and time range for this availability slot.
          </DialogDescription>
        </DialogHeader>

        <form
          id="schedule-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div>
            <Label htmlFor="dayOfWeek" className="mb-2 block">
              Day
            </Label>
            <Controller
              control={control}
              name="dayOfWeek"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="dayOfWeek" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime" className="mb-2 block">
                Start time
              </Label>
              <Input
                id="startTime"
                type="time"
                aria-invalid={Boolean(errors.startTime)}
                {...register("startTime")}
              />
              {errors.startTime && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.startTime.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="endTime" className="mb-2 block">
                End time
              </Label>
              <Input
                id="endTime"
                type="time"
                aria-invalid={Boolean(errors.endTime)}
                {...register("endTime")}
              />
              {errors.endTime && (
                <p className="mt-1.5 text-xs text-destructive">
                  {errors.endTime.message}
                </p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="schedule-form"
            variant="gradient"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Add slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
