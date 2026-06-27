import { Request, Response } from "express";
import {
  createDoctorSchema,
  updateDoctorSchema,
} from "../schemas/doctor.schema";
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

// getDoctors
export const getDoctors = async (_req: Request, res: Response) => {
  try {
    const doctors = await doctorsData.findDoctors();
    return sendSuccess(res, 200, "Doctors fetched successfully", doctors);
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
