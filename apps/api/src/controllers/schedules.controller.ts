import { Request, Response } from "express";
import {
  createScheduleSchema,
  updateScheduleSchema,
} from "../schemas/schedule.schema";
import * as schedulesData from "../data/schedules.data";
import { AppError } from "../errors/AppError";
import { sendSuccess, sendError } from "../helpers/apiResponse";

// createSchedule
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const data = createScheduleSchema.parse(req.body);
    const schedule = await schedulesData.createSchedule(data);
    return sendSuccess(res, 201, "Schedule created successfully", schedule);
  } catch (error) {
    return sendError(res, error);
  }
};

// getSchedules (by doctorId)
export const getSchedules = async (req: Request, res: Response) => {
  try {
    const doctorId = req.query.doctorId;
    if (typeof doctorId !== "string" || doctorId.length === 0) {
      throw new AppError(
        "DOCTOR_ID_REQUIRED",
        "doctorId query param is required",
        400,
      );
    }
    const schedules = await schedulesData.findSchedulesByDoctor(doctorId);
    return sendSuccess(res, 200, "Schedules fetched successfully", schedules);
  } catch (error) {
    return sendError(res, error);
  }
};

// getSchedule By Id
export const getSchedule = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const schedule = await schedulesData.findScheduleById(req.params.id);
    if (!schedule) {
      throw new AppError("SCHEDULE_NOT_FOUND", "No such schedule", 404);
    }
    return sendSuccess(res, 200, "Schedule fetched successfully", schedule);
  } catch (error) {
    return sendError(res, error);
  }
};

// updateSchedule By Id
export const updateSchedule = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const data = updateScheduleSchema.parse(req.body);
    const schedule = await schedulesData.updateSchedule(req.params.id, data);
    return sendSuccess(res, 200, "Schedule updated successfully", schedule);
  } catch (error) {
    return sendError(res, error);
  }
};

// deleteSchedule By Id
export const deleteSchedule = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    await schedulesData.deleteSchedule(req.params.id);
    return sendSuccess(res, 200, "Schedule deleted successfully");
  } catch (error) {
    return sendError(res, error);
  }
};
