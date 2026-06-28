"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { Appointment } from "@/types/appointment";
import { useDoctors } from "@/hooks/useDoctors";
import {
  useCreateAppointment,
  useUpdateAppointment,
} from "@/hooks/useAppointments";
import { combineDateTime, toDateInput, toTimeInput } from "@/lib/datetime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { APPOINTMENT_STATUSES } from "./appointment-status-badge";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm");

const appointmentFormSchema = z
  .object({
    doctorId: z.string().min(1, "Select a doctor"),
    patientName: z.string().min(2, "Patient name is required"),
    date: z.string().min(1, "Pick a date"),
    startTime: time,
    endTime: time,
    status: z.enum(["BOOKED", "COMPLETED", "CANCELLED", "RESCHEDULED"]),
    reason: z.string().max(500, "Keep it under 500 characters").optional(),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-2 block">
        {label}
      </Label>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

type AppointmentDialogProps = {
  appointment?: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AppointmentDialog({
  appointment,
  open,
  onOpenChange,
}: AppointmentDialogProps) {
  const isEdit = Boolean(appointment);
  const doctorsQuery = useDoctors({ limit: 100 });
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      doctorId: "",
      patientName: "",
      date: "",
      startTime: "09:00",
      endTime: "09:30",
      status: "BOOKED",
      reason: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (appointment) {
      reset({
        doctorId: appointment.doctorId,
        patientName: appointment.patientName,
        date: toDateInput(appointment.startTime),
        startTime: toTimeInput(appointment.startTime),
        endTime: toTimeInput(appointment.endTime),
        status: appointment.status,
        reason: appointment.reason ?? "",
      });
    } else {
      reset({
        doctorId: "",
        patientName: "",
        date: "",
        startTime: "09:00",
        endTime: "09:30",
        status: "BOOKED",
        reason: "",
      });
    }
  }, [open, appointment, reset]);

  const isSubmitting =
    createAppointment.isPending || updateAppointment.isPending;

  function onSubmit(values: AppointmentFormValues) {
    const payload = {
      doctorId: values.doctorId,
      patientName: values.patientName,
      startTime: combineDateTime(values.date, values.startTime),
      endTime: combineDateTime(values.date, values.endTime),
      status: values.status,
      reason: values.reason?.trim() ? values.reason.trim() : undefined,
    };

    if (isEdit && appointment) {
      updateAppointment.mutate(
        { id: appointment.id, input: payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createAppointment.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  }

  const doctors = doctorsQuery.data?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit appointment" : "New appointment"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the appointment details."
              : "Book an appointment for a patient."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="appointment-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          <Field
            label="Doctor"
            htmlFor="doctorId"
            error={errors.doctorId?.message}
          >
            <Controller
              control={control}
              name="doctorId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="doctorId" className="w-full">
                    <SelectValue
                      placeholder={
                        doctorsQuery.isPending ? "Loading..." : "Select a doctor"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} · {doctor.speciality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field
            label="Patient name"
            htmlFor="patientName"
            error={errors.patientName?.message}
          >
            <Input
              id="patientName"
              placeholder="Jane Doe"
              aria-invalid={Boolean(errors.patientName)}
              {...register("patientName")}
            />
          </Field>

          <Field
            label="Date"
            htmlFor="date"
            error={errors.date?.message}
            className="sm:col-span-2"
          >
            <Input
              id="date"
              type="date"
              aria-invalid={Boolean(errors.date)}
              {...register("date")}
            />
          </Field>

          <Field
            label="Start time"
            htmlFor="startTime"
            error={errors.startTime?.message}
          >
            <Input
              id="startTime"
              type="time"
              aria-invalid={Boolean(errors.startTime)}
              {...register("startTime")}
            />
          </Field>

          <Field
            label="End time"
            htmlFor="endTime"
            error={errors.endTime?.message}
          >
            <Input
              id="endTime"
              type="time"
              aria-invalid={Boolean(errors.endTime)}
              {...register("endTime")}
            />
          </Field>

          <Field label="Status" htmlFor="status" error={errors.status?.message}>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field
            label="Reason"
            htmlFor="reason"
            error={errors.reason?.message}
            className="sm:col-span-2"
          >
            <Textarea
              id="reason"
              rows={3}
              placeholder="Reason for the visit (optional)"
              aria-invalid={Boolean(errors.reason)}
              {...register("reason")}
            />
          </Field>
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
            form="appointment-form"
            variant="gradient"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Save changes"
                : "Book appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
