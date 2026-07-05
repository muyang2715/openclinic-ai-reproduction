import { z } from "zod";

export const agentChatSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1),
  patientName: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export type AgentChatInput = z.infer<typeof agentChatSchema>;
