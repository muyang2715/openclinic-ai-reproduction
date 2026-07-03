import { PineconeStore } from "@langchain/pinecone";

import { embeddings } from "./embeddings";
import { pineconeIndex } from "./pinecone";

// Shared LangChain vector store over the Pinecone index. Used by knowledge-base
// ingestion now, and reused as the FAQ agent's retriever in a later phase.
const getVectorStore = () =>
  new PineconeStore(embeddings, { pineconeIndex });

export { getVectorStore };
