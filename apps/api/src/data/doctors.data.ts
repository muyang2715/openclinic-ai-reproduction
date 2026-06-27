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

export const findDoctors = () => prisma.doctor.findMany();

export const findDoctorById = (id: string) =>
  prisma.doctor.findUnique({ where: { id } });

export const updateDoctor = (id: string, data: UpdateDoctorInput) =>
  prisma.doctor.update({ where: { id }, data: data as Prisma.DoctorUpdateInput });

export const deleteDoctor = (id: string) =>
  prisma.doctor.delete({ where: { id } });
