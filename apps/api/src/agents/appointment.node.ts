import {
  SystemMessage,
  ToolMessage,
  isAIMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import type { StructuredToolInterface } from "@langchain/core/tools";

import {
  APPOINTMENT_SYSTEM_PROMPT,
  APPOINTMENT_TOOL_MAX_ITERATIONS,
} from "../config/agents";
import { chatModel } from "../libs/chatModel";
import {
  bookAppointmentTool,
  listDoctorsTool,
} from "./tools/appointment.tools";
import { messageText, type AgentStateType } from "./state";

const tools = [listDoctorsTool, bookAppointmentTool];
const toolsByName: Record<string, StructuredToolInterface> = {
  list_doctors: listDoctorsTool,
  book_appointment: bookAppointmentTool,
};

const FALLBACK =
  "I can help you book an appointment — could you tell me the doctor or speciality, your name, and a preferred date and time?";

// Appointment agent — explicit tool-calling loop (createReactAgent is deprecated
// in LangGraph v1). Tools validate their own args with zod (Rule #2).
export const appointmentNode = async (
  state: AgentStateType,
): Promise<Partial<AgentStateType>> => {
  const system = await PromptTemplate.fromTemplate(
    APPOINTMENT_SYSTEM_PROMPT,
  ).format({ now: new Date().toISOString() });

  const llm = chatModel().bindTools(tools);

  // Seed with prior conversation (already includes the latest user message).
  const working: BaseMessage[] = [
    new SystemMessage(state.patientName ? `${system}\nPatient name: ${state.patientName}` : system),
    ...state.messages,
  ];
  const produced: BaseMessage[] = [];
  let reply = FALLBACK;

  for (let i = 0; i < APPOINTMENT_TOOL_MAX_ITERATIONS; i += 1) {
    const ai = await llm.invoke(working);
    working.push(ai);
    produced.push(ai);

    const toolCalls = isAIMessage(ai) ? (ai.tool_calls ?? []) : [];
    if (toolCalls.length === 0) {
      reply = messageText(ai.content) || FALLBACK;
      break;
    }

    for (const call of toolCalls) {
      const selected = toolsByName[call.name];
      const result: BaseMessage = selected
        ? ((await selected.invoke(call)) as BaseMessage)
        : new ToolMessage({
            content: `Unknown tool: ${call.name}`,
            tool_call_id: call.id ?? "",
          });
      working.push(result);
      produced.push(result);
    }
  }

  return { reply, messages: produced };
};
