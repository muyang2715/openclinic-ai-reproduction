import { z } from "zod";
import { AppointmentStatus } from "../generated/prisma/enums";

const appointmentBaseSchema = z.object({
  doctorId: z.string().min(1),
  patientName: z.string().min(1),
  patientEmail: z.string().email().optional(),
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

export const listAppointmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  doctorId: z.string().trim().min(1).optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  search: z.string().trim().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
