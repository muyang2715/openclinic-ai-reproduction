import { Request, Response } from "express";
import {
  createExceptionSchema,
  updateExceptionSchema,
} from "../schemas/exception.schema";
import * as exceptionsData from "../data/exceptions.data";
import { AppError } from "../errors/AppError";
import { sendSuccess, sendError } from "../helpers/apiResponse";

// createException
export const createException = async (req: Request, res: Response) => {
  try {
    const data = createExceptionSchema.parse(req.body);
    const exception = await exceptionsData.createException(data);
    return sendSuccess(res, 201, "Exception created successfully", exception);
  } catch (error) {
    return sendError(res, error);
  }
};

// getExceptions (by doctorId)
export const getExceptions = async (req: Request, res: Response) => {
  try {
    const doctorId = req.query.doctorId;
    if (typeof doctorId !== "string" || doctorId.length === 0) {
      throw new AppError(
        "DOCTOR_ID_REQUIRED",
        "doctorId query param is required",
        400,
      );
    }
    const exceptions = await exceptionsData.findExceptionsByDoctor(doctorId);
    return sendSuccess(res, 200, "Exceptions fetched successfully", exceptions);
  } catch (error) {
    return sendError(res, error);
  }
};

// getException By Id
export const getException = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const exception = await exceptionsData.findExceptionById(req.params.id);
    if (!exception) {
      throw new AppError("EXCEPTION_NOT_FOUND", "No such exception", 404);
    }
    return sendSuccess(res, 200, "Exception fetched successfully", exception);
  } catch (error) {
    return sendError(res, error);
  }
};

// updateException By Id
export const updateException = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const data = updateExceptionSchema.parse(req.body);
    const exception = await exceptionsData.updateException(req.params.id, data);
    return sendSuccess(res, 200, "Exception updated successfully", exception);
  } catch (error) {
    return sendError(res, error);
  }
};

// deleteException By Id
export const deleteException = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    await exceptionsData.deleteException(req.params.id);
    return sendSuccess(res, 200, "Exception deleted successfully");
  } catch (error) {
    return sendError(res, error);
  }
};
