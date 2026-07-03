import { Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";

// List rows exclude the bulky `transcript` JSON (loaded only on detail).
const callListSelect = {
  id: true,
  callId: true,
  startedAt: true,
  endedAt: true,
  durationSec: true,
  patientName: true,
  userTurns: true,
  status: true,
  audioKey: true,
  createdAt: true,
} satisfies Prisma.CallSelect;

export const createCall = (data: {
  callId: string;
  startedAt: Date;
  endedAt: Date;
  durationSec: number;
  patientName?: string;
  userTurns: number;
  transcript: Prisma.InputJsonValue;
  audioKey?: string | null;
  status: string;
}) => prisma.call.create({ data });

export const findCalls = (args: {
  skip: number;
  take: number;
  where: Prisma.CallWhereInput;
}) =>
  prisma.call.findMany({
    where: args.where,
    skip: args.skip,
    take: args.take,
    orderBy: { createdAt: "desc" },
    select: callListSelect,
  });

export const countCalls = (where: Prisma.CallWhereInput) =>
  prisma.call.count({ where });

export const findCallById = (id: string) =>
  prisma.call.findUnique({ where: { id } });
