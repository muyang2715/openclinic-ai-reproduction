import { ChatOpenAI } from "@langchain/openai";

import { OPENAI_API_KEY } from "../config/config";
import { OPENAI_CHAT_MODEL, OPENAI_ROUTER_MODEL } from "../config/agents";

// Higher-quality model for agent responses (FAQ answers, appointment dialog).
export const chatModel = () =>
  new ChatOpenAI({
    apiKey: OPENAI_API_KEY,
    model: OPENAI_CHAT_MODEL,
    temperature: 0.3,
  });

// Cheap, fast model for routing/classification (guardrail, supervisor, triage).
export const routerModel = () =>
  new ChatOpenAI({
    apiKey: OPENAI_API_KEY,
    model: OPENAI_ROUTER_MODEL,
    temperature: 0,
  });
