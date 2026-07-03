import { END, MemorySaver, START, StateGraph } from "@langchain/langgraph";

import { AgentState } from "./state";
import { guardrailNode } from "./guardrail.node";
import { supervisorNode } from "./supervisor.node";
import { faqNode } from "./faq.node";
import { appointmentNode } from "./appointment.node";
import { emergencyNode } from "./emergency.node";

// START -> guardrail -> (END if blocked | supervisor) -> {faq|appointment|emergency} -> END
export const agentGraph = new StateGraph(AgentState)
  .addNode("guardrail", guardrailNode)
  .addNode("supervisor", supervisorNode)
  .addNode("faq", faqNode)
  .addNode("appointment", appointmentNode)
  .addNode("emergency", emergencyNode)
  .addEdge(START, "guardrail")
  .addConditionalEdges(
    "guardrail",
    (state) => (state.blocked ? END : "supervisor"),
    { [END]: END, supervisor: "supervisor" },
  )
  .addConditionalEdges("supervisor", (state) => state.route ?? "faq", {
    faq: "faq",
    appointment: "appointment",
    emergency: "emergency",
  })
  .addEdge("faq", END)
  .addEdge("appointment", END)
  .addEdge("emergency", END)
  .compile({ checkpointer: new MemorySaver() });
