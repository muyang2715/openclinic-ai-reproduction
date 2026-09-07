import { OpenAIEmbeddings } from "@langchain/openai";

import {
  OPENAI_API_KEY,
  OPENAI_BASE_URL,
  OPENAI_EMBEDDING_DIMENSIONS,
  OPENAI_EMBEDDING_MODEL,
} from "../config/config";

const embeddings = new OpenAIEmbeddings({
  apiKey: OPENAI_API_KEY,
  model: OPENAI_EMBEDDING_MODEL,
  dimensions: OPENAI_EMBEDDING_DIMENSIONS,
  ...(OPENAI_BASE_URL
    ? { configuration: { baseURL: OPENAI_BASE_URL } }
    : {}),
});

export { embeddings };
