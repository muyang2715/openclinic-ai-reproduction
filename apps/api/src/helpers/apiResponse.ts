import { Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../errors/AppError";

export const sendSuccess = (
  res: Response,
  status: number,
  message: string,
  data?: unknown,
) => res.status(status).json({ success: true, message, data });

export const sendError = (res: Response, error: unknown) => {
  if (error instanceof AppError) {
    return res
      .status(error.status)
      .json({ success: false, message: error.message });
  }

  if (error instanceof ZodError) {
    return res
      .status(400)
      .json({ success: false, message: "Validation failed", errors: error.issues });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });
    }
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, message: "Resource already exists" });
    }
    if (error.code === "P2003") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid doctor reference" });
    }
  }

  console.error(error);
  return res
    .status(500)
    .json({ success: false, message: "Internal server error" });
};
