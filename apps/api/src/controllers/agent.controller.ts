import { Request, Response } from "express";

import { runAgent } from "../agents";
import { agentChatSchema } from "../schemas/agent.schema";
import { sendSuccess, sendError } from "../helpers/apiResponse";

// chat — runs one turn through the multi-agent supervisor and returns the reply.
export const chat = async (req: Request, res: Response) => {
  try {
    const { sessionId, message, patientName } = agentChatSchema.parse(req.body);
    const result = await runAgent({
      sessionId,
      message,
      ...(patientName ? { patientName } : {}),
    });
    return sendSuccess(res, 200, "Agent replied successfully", result);
  } catch (error) {
    return sendError(res, error);
  }
};
