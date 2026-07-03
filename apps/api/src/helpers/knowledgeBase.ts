import { Document as LCDocument } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { CHUNK_OVERLAP, CHUNK_SIZE } from "../config/constants";
import { pineconeIndex } from "../libs/pinecone";
import { getVectorStore } from "../libs/vectorStore";

// Vector ids are deterministic per document so deletion never touches other docs.
const vectorId = (documentId: string, chunkIndex: number) =>
  `${documentId}-${chunkIndex}`;

// Splits text into chunks, embeds them, and upserts to Pinecone. Returns the chunk count.
export const ingestDocument = async (
  documentId: string,
  fileName: string,
  text: string,
): Promise<number> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const chunks = await splitter.splitText(text);

  const docs = chunks.map(
    (chunk, index) =>
      new LCDocument({
        pageContent: chunk,
        metadata: { documentId, fileName, chunkIndex: index },
      }),
  );
  const ids = chunks.map((_, index) => vectorId(documentId, index));

  await getVectorStore().addDocuments(docs, { ids });

  return chunks.length;
};

// Removes a document's chunks from Pinecone by their deterministic ids.
export const deleteDocumentVectors = async (
  documentId: string,
  chunkCount: number,
): Promise<void> => {
  if (chunkCount <= 0) return;
  const ids = Array.from({ length: chunkCount }, (_, index) =>
    vectorId(documentId, index),
  );
  await pineconeIndex.deleteMany(ids);
};
