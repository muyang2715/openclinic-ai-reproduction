import { OpenAIEmbeddings } from "@langchain/openai";

import { OPENAI_API_KEY } from "../config/config";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "../config/constants";

const embeddings = new OpenAIEmbeddings({
  apiKey: OPENAI_API_KEY,
  model: EMBEDDING_MODEL,
  dimensions: EMBEDDING_DIMENSIONS,
});

export { embeddings };
