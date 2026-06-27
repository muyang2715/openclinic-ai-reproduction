import { Request, Response } from "express";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "../schemas/appointment.schema";
import * as appointmentsData from "../data/appointments.data";
import { AppError } from "../errors/AppError";
import { sendSuccess, sendError } from "../helpers/apiResponse";

// createAppointment
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const data = createAppointmentSchema.parse(req.body);
    const appointment = await appointmentsData.createAppointment(data);
    return sendSuccess(
      res,
      201,
      "Appointment created successfully",
      appointment,
    );
  } catch (error) {
    return sendError(res, error);
  }
};

// getAppointments (optionally by doctorId)
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const doctorId =
      typeof req.query.doctorId === "string" ? req.query.doctorId : undefined;
    const appointments = await appointmentsData.findAppointments(doctorId);
    return sendSuccess(
      res,
      200,
      "Appointments fetched successfully",
      appointments,
    );
  } catch (error) {
    return sendError(res, error);
  }
};

// getAppointment By Id
export const getAppointment = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const appointment = await appointmentsData.findAppointmentById(
      req.params.id,
    );
    if (!appointment) {
      throw new AppError("APPOINTMENT_NOT_FOUND", "No such appointment", 404);
    }
    return sendSuccess(
      res,
      200,
      "Appointment fetched successfully",
      appointment,
    );
  } catch (error) {
    return sendError(res, error);
  }
};

// updateAppointment By Id
export const updateAppointment = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const data = updateAppointmentSchema.parse(req.body);
    const appointment = await appointmentsData.updateAppointment(
      req.params.id,
      data,
    );
    return sendSuccess(
      res,
      200,
      "Appointment updated successfully",
      appointment,
    );
  } catch (error) {
    return sendError(res, error);
  }
};

// deleteAppointment By Id
export const deleteAppointment = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    await appointmentsData.deleteAppointment(req.params.id);
    return sendSuccess(res, 200, "Appointment deleted successfully");
  } catch (error) {
    return sendError(res, error);
  }
};
