import { Pinecone } from "@pinecone-database/pinecone";

import { PINECONE_API_KEY, PINECONE_INDEX } from "../config/config";

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

const pineconeIndex = pinecone.index(PINECONE_INDEX);

export { pinecone, pineconeIndex };
