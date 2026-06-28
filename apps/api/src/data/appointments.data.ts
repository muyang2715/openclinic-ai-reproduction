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

const doctorInclude = {
  doctor: { select: { id: true, name: true, speciality: true } },
} satisfies Prisma.AppointmentInclude;

export const findAppointments = (args: {
  skip: number;
  take: number;
  where: Prisma.AppointmentWhereInput;
}) =>
  prisma.appointment.findMany({
    where: args.where,
    skip: args.skip,
    take: args.take,
    orderBy: { startTime: "desc" },
    include: doctorInclude,
  });

export const countAppointments = (where: Prisma.AppointmentWhereInput) =>
  prisma.appointment.count({ where });

export const findAppointmentById = (id: string) =>
  prisma.appointment.findUnique({ where: { id }, include: doctorInclude });

export const updateAppointment = (id: string, data: UpdateAppointmentInput) =>
  prisma.appointment.update({
    where: { id },
    data: data as Prisma.AppointmentUpdateInput,
  });

export const deleteAppointment = (id: string) =>
  prisma.appointment.delete({ where: { id } });
