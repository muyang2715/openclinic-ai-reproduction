import { Request, Response } from "express";
import {
  createDoctorSchema,
  updateDoctorSchema,
  listDoctorsQuerySchema,
} from "../schemas/doctor.schema";
import { Prisma } from "../generated/prisma/client";
import * as doctorsData from "../data/doctors.data";
import { AppError } from "../errors/AppError";
import { sendSuccess, sendError } from "../helpers/apiResponse";

// createDoctor
export const createDoctor = async (req: Request, res: Response) => {
  try {
    const data = createDoctorSchema.parse(req.body);
    const doctor = await doctorsData.createDoctor(data);
    return sendSuccess(res, 201, "Doctor created successfully", doctor);
  } catch (error) {
    return sendError(res, error);
  }
};

// getDoctors (paginated, searchable, filterable by status)
export const getDoctors = async (req: Request, res: Response) => {
  try {
    const { page, limit, search, status } = listDoctorsQuerySchema.parse(
      req.query,
    );

    const where: Prisma.DoctorWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { speciality: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) {
      where.isActive = status === "active";
    }

    const [items, total] = await Promise.all([
      doctorsData.findDoctors({ skip: (page - 1) * limit, take: limit, where }),
      doctorsData.countDoctors(where),
    ]);

    return sendSuccess(res, 200, "Doctors fetched successfully", {
      items,
      total,
      page,
      limit,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// getDoctor By Id
export const getDoctor = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const doctor = await doctorsData.findDoctorById(req.params.id);
    if (!doctor) {
      throw new AppError("DOCTOR_NOT_FOUND", "No such doctor", 404);
    }
    return sendSuccess(res, 200, "Doctor fetched successfully", doctor);
  } catch (error) {
    return sendError(res, error);
  }
};

// updateDoctor By Id
export const updateDoctor = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const data = updateDoctorSchema.parse(req.body);
    const doctor = await doctorsData.updateDoctor(req.params.id, data);
    return sendSuccess(res, 200, "Doctor updated successfully", doctor);
  } catch (error) {
    return sendError(res, error);
  }
};

// deleteDoctor By Id
export const deleteDoctor = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    await doctorsData.deleteDoctor(req.params.id);
    return sendSuccess(res, 200, "Doctor deleted successfully");
  } catch (error) {
    return sendError(res, error);
  }
};
