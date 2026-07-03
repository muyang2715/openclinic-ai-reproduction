import { HumanMessage } from "@langchain/core/messages";

import type { AgentRouteValue } from "../config/agents";
import { agentGraph } from "./graph";

export type RunAgentInput = {
  sessionId: string;
  message: string;
  patientName?: string;
};

export type RunAgentResult = {
  reply: string;
  route: AgentRouteValue | null;
};

// Single entry the REST controller (and later the voice pipeline) calls. The
// MemorySaver checkpointer keys conversation history by thread_id = sessionId.
export const runAgent = async (
  input: RunAgentInput,
): Promise<RunAgentResult> => {
  const result = await agentGraph.invoke(
    {
      input: input.message,
      messages: [new HumanMessage(input.message)],
      sessionId: input.sessionId,
      ...(input.patientName ? { patientName: input.patientName } : {}),
    },
    { configurable: { thread_id: input.sessionId } },
  );

  return {
    reply: result.reply ?? "Sorry, I couldn't process that request.",
    route: (result.route as AgentRouteValue | undefined) ?? null,
  };
};
