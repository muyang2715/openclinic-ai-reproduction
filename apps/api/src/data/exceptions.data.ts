import { Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import {
  CreateExceptionInput,
  UpdateExceptionInput,
} from "../schemas/exception.schema";

export const createException = (data: CreateExceptionInput) =>
  prisma.scheduleException.create({
    data: data as Prisma.ScheduleExceptionUncheckedCreateInput,
  });

export const findExceptionsByDoctor = (doctorId: string) =>
  prisma.scheduleException.findMany({ where: { doctorId } });

export const findExceptionById = (id: string) =>
  prisma.scheduleException.findUnique({ where: { id } });

export const updateException = (id: string, data: UpdateExceptionInput) =>
  prisma.scheduleException.update({
    where: { id },
    data: data as Prisma.ScheduleExceptionUpdateInput,
  });

export const deleteException = (id: string) =>
  prisma.scheduleException.delete({ where: { id } });
