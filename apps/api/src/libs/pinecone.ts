import { Pinecone } from "@pinecone-database/pinecone";

import { PINECONE_API_KEY, PINECONE_INDEX } from "../config/config";

let pinecone: Pinecone | undefined;

export const isPineconeConfigured = () =>
  Boolean(PINECONE_API_KEY && PINECONE_INDEX);

export const getPineconeIndex = () => {
  if (!isPineconeConfigured()) {
    throw new Error(
      "Pinecone is not configured. Set PINECONE_API_KEY and PINECONE_INDEX.",
    );
  }

  pinecone ??= new Pinecone({ apiKey: PINECONE_API_KEY });
  return pinecone.index(PINECONE_INDEX);
};
