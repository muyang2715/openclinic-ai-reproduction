import { Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import {
  CreateScheduleInput,
  UpdateScheduleInput,
} from "../schemas/schedule.schema";

export const createSchedule = (data: CreateScheduleInput) =>
  prisma.doctorSchedule.create({ data });

export const findSchedulesByDoctor = (doctorId: string) =>
  prisma.doctorSchedule.findMany({ where: { doctorId } });

export const findScheduleById = (id: string) =>
  prisma.doctorSchedule.findUnique({ where: { id } });

export const updateSchedule = (id: string, data: UpdateScheduleInput) =>
  prisma.doctorSchedule.update({
    where: { id },
    data: data as Prisma.DoctorScheduleUpdateInput,
  });

export const deleteSchedule = (id: string) =>
  prisma.doctorSchedule.delete({ where: { id } });
