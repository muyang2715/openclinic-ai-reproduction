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

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
