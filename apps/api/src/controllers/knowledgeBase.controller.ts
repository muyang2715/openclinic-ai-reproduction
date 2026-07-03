import { Request, Response } from "express";

import { Prisma } from "../generated/prisma/client";
import * as kbData from "../data/knowledgeBase.data";
import { AppError } from "../errors/AppError";
import { sendSuccess, sendError } from "../helpers/apiResponse";
import { extractText } from "../helpers/textExtraction";
import { deleteDocumentVectors, ingestDocument } from "../helpers/knowledgeBase";
import {
  documentIdParamSchema,
  listDocumentsQuerySchema,
} from "../schemas/knowledgeBase.schema";
import { DocumentStatus } from "../config/constants";

// uploadDocument — extract text, chunk, embed, upsert to Pinecone, record in DB
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      throw new AppError("NO_FILE", "No file uploaded", 400);
    }

    const { text, fileType } = await extractText(file.buffer, file.mimetype);

    const document = await kbData.createDocument({
      fileName: file.originalname,
      fileType,
      fileSize: file.size,
      content: text,
      status: DocumentStatus.Processing,
    });

    try {
      const chunkCount = await ingestDocument(
        document.id,
        document.fileName,
        text,
      );
      const updated = await kbData.updateDocumentChunkCount(
        document.id,
        chunkCount,
        DocumentStatus.Ready,
      );
      return sendSuccess(res, 201, "Document uploaded successfully", updated);
    } catch (ingestError) {
      // Roll back the orphaned row if embedding/upsert failed.
      await kbData.deleteDocument(document.id).catch(() => undefined);
      throw ingestError;
    }
  } catch (error) {
    return sendError(res, error);
  }
};

// getDocuments — paginated, searchable by file name
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { page, limit, search } = listDocumentsQuerySchema.parse(req.query);

    const where: Prisma.DocumentWhereInput = {};
    if (search) {
      where.fileName = { contains: search, mode: "insensitive" };
    }

    const [items, total] = await Promise.all([
      kbData.findDocuments({ skip: (page - 1) * limit, take: limit, where }),
      kbData.countDocuments(where),
    ]);

    return sendSuccess(res, 200, "Documents fetched successfully", {
      items,
      total,
      page,
      limit,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// deleteDocument — purge the document's Pinecone vectors, then remove the row
export const deleteDocument = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = documentIdParamSchema.parse(req.params);

    const document = await kbData.findDocumentById(id);
    if (!document) {
      throw new AppError("DOCUMENT_NOT_FOUND", "No such document", 404);
    }

    await deleteDocumentVectors(document.id, document.chunkCount);
    await kbData.deleteDocument(document.id);

    return sendSuccess(res, 200, "Document deleted successfully");
  } catch (error) {
    return sendError(res, error);
  }
};
