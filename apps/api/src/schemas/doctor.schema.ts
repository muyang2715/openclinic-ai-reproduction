import { z } from "zod";
import { scheduleInputSchema } from "./schedule.schema";

const doctorBaseSchema = z.object({
  name: z.string().min(1),
  department: z.string().min(1),
  speciality: z.string().min(1),
  isActive: z.boolean().default(true),
});

export const createDoctorSchema = doctorBaseSchema.extend({
  schedules: z.array(scheduleInputSchema).optional(),
});

export const updateDoctorSchema = doctorBaseSchema.partial();

export const listDoctorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type ListDoctorsQuery = z.infer<typeof listDoctorsQuerySchema>;
