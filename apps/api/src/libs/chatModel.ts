import { ChatOpenAI } from "@langchain/openai";

import {
  OPENAI_API_KEY,
  OPENAI_BASE_URL,
  OPENAI_CHAT_MODEL,
  OPENAI_ROUTER_MODEL,
} from "../config/config";

const openAIConfiguration = OPENAI_BASE_URL
  ? { configuration: { baseURL: OPENAI_BASE_URL } }
  : {};

// Higher-quality model for agent responses (FAQ answers, appointment dialog).
export const chatModel = () =>
  new ChatOpenAI({
    apiKey: OPENAI_API_KEY,
    model: OPENAI_CHAT_MODEL,
    temperature: 0.3,
    ...openAIConfiguration,
  });

// Cheap, fast model for routing/classification (guardrail, supervisor, triage).
export const routerModel = () =>
  new ChatOpenAI({
    apiKey: OPENAI_API_KEY,
    model: OPENAI_ROUTER_MODEL,
    temperature: 0,
    ...openAIConfiguration,
  });
