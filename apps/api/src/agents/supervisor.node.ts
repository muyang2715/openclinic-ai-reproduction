import {
  isAIMessage,
  isHumanMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod/v4";

import { SUPERVISOR_PROMPT } from "../config/agents";
import { routerModel } from "../libs/chatModel";
import { messageText, type AgentStateType } from "./state";

const RouteDecision = z.object({
  route: z.enum(["faq", "appointment", "emergency"]),
});

const TRANSCRIPT_TURNS = 6;

// Render the recent conversation as labelled lines so the supervisor can route
// follow-up answers (a name, a time, "yes") in context — skipping tool plumbing
// and empty tool-call AI messages.
const renderConversation = (messages: BaseMessage[]): string => {
  const lines: string[] = [];
  for (const m of messages) {
    if (isHumanMessage(m)) {
      const text = messageText(m.content).trim();
      if (text) lines.push(`Patient: ${text}`);
    } else if (isAIMessage(m)) {
      const text = messageText(m.content).trim();
      if (text) lines.push(`Assistant: ${text}`);
    }
  }
  return lines.slice(-TRANSCRIPT_TURNS).join("\n") || "(no prior messages)";
};

// Supervisor — routes the message to exactly one specialist via structured
// output, using the recent conversation + the previous route for continuity.
export const supervisorNode = async (
  state: AgentStateType,
): Promise<Partial<AgentStateType>> => {
  const prompt = await PromptTemplate.fromTemplate(SUPERVISOR_PROMPT).format({
    conversation: renderConversation(state.messages),
    previousRoute: state.route ?? "none",
    message: state.input,
  });

  const { route } = await routerModel()
    .withStructuredOutput(RouteDecision)
    .invoke(prompt);

  return { route };
};
