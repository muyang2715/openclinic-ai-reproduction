import { AIMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod/v4";

import { EMERGENCY_DETECT_PROMPT } from "../config/agents";
import { routerModel } from "../libs/chatModel";
import { sendEmergencyAlert } from "../libs/mailer";
import type { AgentStateType } from "./state";

const Triage = z.object({
  isEmergency: z.boolean(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  summary: z.string().describe("one-line summary of the situation"),
});

const URGENT =
  "This sounds like a medical emergency. Please call your local emergency number (for example 911) right now, or go to the nearest emergency room. I've also alerted the clinic team.";

const NON_URGENT =
  "I'm sorry you're not feeling well. If your symptoms become severe or sudden, please call emergency services immediately. Otherwise, I can help you book an appointment with a doctor — would you like that?";

// Emergency agent — detection (here) is separate from notification (lib/mailer, §5).
export const emergencyNode = async (
  state: AgentStateType,
): Promise<Partial<AgentStateType>> => {
  const prompt = await PromptTemplate.fromTemplate(
    EMERGENCY_DETECT_PROMPT,
  ).format({ message: state.input });

  const triage = await routerModel()
    .withStructuredOutput(Triage)
    .invoke(prompt);

  if (triage.isEmergency) {
    await sendEmergencyAlert({
      summary: triage.summary,
      message: state.input,
      ...(state.patientName ? { patientName: state.patientName } : {}),
    });
    return { reply: URGENT, messages: [new AIMessage(URGENT)] };
  }

  return { reply: NON_URGENT, messages: [new AIMessage(NON_URGENT)] };
};
