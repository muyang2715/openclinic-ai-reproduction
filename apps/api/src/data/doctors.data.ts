import { Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import { CreateDoctorInput, UpdateDoctorInput } from "../schemas/doctor.schema";

export const createDoctor = ({ schedules, ...doctor }: CreateDoctorInput) =>
  prisma.doctor.create({
    data:
      schedules && schedules.length > 0
        ? { ...doctor, schedules: { create: schedules } }
        : doctor,
    include: { schedules: true },
  });

export const findDoctors = (args: {
  skip: number;
  take: number;
  where: Prisma.DoctorWhereInput;
}) =>
  prisma.doctor.findMany({
    where: args.where,
    skip: args.skip,
    take: args.take,
    orderBy: { createdAt: "desc" },
  });

export const countDoctors = (where: Prisma.DoctorWhereInput) =>
  prisma.doctor.count({ where });

export const findDoctorById = (id: string) =>
  prisma.doctor.findUnique({ where: { id }, include: { schedules: true } });

export const updateDoctor = (id: string, data: UpdateDoctorInput) =>
  prisma.doctor.update({ where: { id }, data: data as Prisma.DoctorUpdateInput });

export const deleteDoctor = (id: string) =>
  prisma.doctor.delete({ where: { id } });
