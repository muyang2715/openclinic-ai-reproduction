import { z } from "zod";
import { AppointmentStatus } from "../generated/prisma/enums";

const appointmentBaseSchema = z.object({
  doctorId: z.string().min(1),
  patientName: z.string().min(1),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  status: z.nativeEnum(AppointmentStatus).default(AppointmentStatus.BOOKED),
  reason: z.string().optional(),
});

export const createAppointmentSchema = appointmentBaseSchema.refine(
  (data) => data.endTime > data.startTime,
  { message: "endTime must be after startTime", path: ["endTime"] },
);

export const updateAppointmentSchema = appointmentBaseSchema.partial();

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
