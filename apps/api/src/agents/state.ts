import "@langchain/langgraph/zod"; // augments zod/v4 with .register() for LangGraph
import { messagesStateReducer } from "@langchain/langgraph";
import { registry } from "@langchain/langgraph/zod";
import type { BaseMessage } from "@langchain/core/messages";
import { z } from "zod/v4";

// Shared graph state as a Zod schema (LangGraph v1 "StateSchema", not Annotation).
// `messages` uses LangGraph's append reducer so the MemorySaver checkpointer
// accumulates conversation history per session/thread.
export const AgentState = z.object({
  messages: z.array(z.custom<BaseMessage>()).register(registry, {
    reducer: {
      fn: (left: BaseMessage[], right: BaseMessage[]) =>
        messagesStateReducer(left, right),
    },
    default: () => [],
  }),
  input: z.string(),
  sessionId: z.string(),
  patientName: z.string().optional(),
  route: z.enum(["faq", "appointment", "emergency"]).optional(),
  reply: z.string().optional(),
  blocked: z.boolean().optional(),
});

export type AgentStateType = z.infer<typeof AgentState>;

// Coerce LLM message content (string | parts[]) to plain text.
export function messageText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        typeof part === "string"
          ? part
          : part && typeof part === "object" && "text" in part
            ? String((part as { text: unknown }).text)
            : "",
      )
      .join("");
  }
  return String(content ?? "");
}
