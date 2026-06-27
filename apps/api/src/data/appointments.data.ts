import { Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "../schemas/appointment.schema";

export const createAppointment = (data: CreateAppointmentInput) =>
  prisma.appointment.create({
    data: data as Prisma.AppointmentUncheckedCreateInput,
  });

export const findAppointments = (doctorId?: string) => {
  const args: Prisma.AppointmentFindManyArgs = doctorId
    ? { where: { doctorId } }
    : {};
  return prisma.appointment.findMany(args);
};

export const findAppointmentById = (id: string) =>
  prisma.appointment.findUnique({ where: { id } });

export const updateAppointment = (id: string, data: UpdateAppointmentInput) =>
  prisma.appointment.update({
    where: { id },
    data: data as Prisma.AppointmentUpdateInput,
  });

export const deleteAppointment = (id: string) =>
  prisma.appointment.delete({ where: { id } });
