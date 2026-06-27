import { ErrorRequestHandler } from "express";
import { sendError } from "../helpers/apiResponse";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  sendError(res, err);
};
