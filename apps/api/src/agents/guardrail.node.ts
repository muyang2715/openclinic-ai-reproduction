import { AIMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod/v4";

import { GUARDRAIL_PROMPT } from "../config/agents";
import { routerModel } from "../libs/chatModel";
import type { AgentStateType } from "./state";

const GuardrailDecision = z.object({
  allowed: z
    .boolean()
    .describe("true if the message is an in-scope, safe clinic request"),
  reason: z.string().describe("a short reason for the decision"),
});

const REFUSAL =
  "I'm OpenClinic AI's receptionist, so I can only help with clinic questions, appointments, and medical concerns. How can I help with your visit?";

// Input guardrail — blocks out-of-scope/unsafe messages before any agent runs.
export const guardrailNode = async (
  state: AgentStateType,
): Promise<Partial<AgentStateType>> => {
  const prompt = await PromptTemplate.fromTemplate(GUARDRAIL_PROMPT).format({
    message: state.input,
  });

  const decision = await routerModel()
    .withStructuredOutput(GuardrailDecision)
    .invoke(prompt);

  if (!decision.allowed) {
    return { blocked: true, reply: REFUSAL, messages: [new AIMessage(REFUSAL)] };
  }
  return { blocked: false };
};
