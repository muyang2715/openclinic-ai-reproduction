import { Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

// List/response rows exclude the bulky `content` field.
const documentListSelect = {
  id: true,
  fileName: true,
  fileType: true,
  fileSize: true,
  chunkCount: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DocumentSelect;

export const createDocument = (data: {
  fileName: string;
  fileType: string;
  fileSize: number;
  content: string;
  status: string;
}) => prisma.document.create({ data });

export const findDocuments = (args: {
  skip: number;
  take: number;
  where: Prisma.DocumentWhereInput;
}) =>
  prisma.document.findMany({
    where: args.where,
    skip: args.skip,
    take: args.take,
    orderBy: { createdAt: "desc" },
    select: documentListSelect,
  });

export const countDocuments = (where: Prisma.DocumentWhereInput) =>
  prisma.document.count({ where });

export const findDocumentById = (id: string) =>
  prisma.document.findUnique({ where: { id } });

export const updateDocumentChunkCount = (
  id: string,
  chunkCount: number,
  status: string,
) =>
  prisma.document.update({
    where: { id },
    data: { chunkCount, status },
    select: documentListSelect,
  });

export const deleteDocument = (id: string) =>
  prisma.document.delete({ where: { id } });
