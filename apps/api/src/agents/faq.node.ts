import { AIMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";

import { FAQ_PROMPT, FAQ_TOP_K } from "../config/agents";
import { chatModel } from "../libs/chatModel";
import { getVectorStore } from "../libs/vectorStore";
import { messageText, type AgentStateType } from "./state";

// FAQ agent — answers strictly from the RAG knowledge base (Pinecone).
export const faqNode = async (
  state: AgentStateType,
): Promise<Partial<AgentStateType>> => {
  const docs = await getVectorStore().similaritySearch(state.input, FAQ_TOP_K);
  const context =
    docs.map((d) => d.pageContent).join("\n\n---\n\n") ||
    "(no relevant documents found)";

  const prompt = await PromptTemplate.fromTemplate(FAQ_PROMPT).format({
    context,
    question: state.input,
  });

  const response = await chatModel().invoke(prompt);
  const reply = messageText(response.content);

  return { reply, messages: [new AIMessage(reply)] };
};
