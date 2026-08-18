"use server";

import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";

import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ActionError } from "@/lib/errors/action-error";
import { savedBlockDataSchema } from "@/features/page-builder/puck/schema";

async function assertAuthenticated() {
  const user = await getSessionUser();
  if (!user) throw new ActionError("UNAUTHORIZED", "Unauthorized");

  return user;
}

export async function listSavedBlocks() {
  await assertAuthenticated();

  const blocks = await prisma.savedBlock.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, data: true, createdAt: true },
  });

  return blocks;
}

export async function createSavedBlock(name: string, data: unknown) {
  await assertAuthenticated();

  const trimmedName = name.trim().slice(0, 100);
  if (!trimmedName) throw new ActionError("VALIDATION", "NAME_REQUIRED");

  const parsed = savedBlockDataSchema.safeParse(data);
  if (!parsed.success) {
    throw new ActionError("VALIDATION", "INVALID_BLOCK_DATA");
  }

  const block = await prisma.savedBlock.create({
    data: {
      id: randomUUID(),
      name: trimmedName,
      data: parsed.data as Prisma.InputJsonValue,
    },
    select: { id: true, name: true, data: true, createdAt: true },
  });

  return block;
}

export async function deleteSavedBlock(id: string) {
  await assertAuthenticated();

  const existing = await prisma.savedBlock.findFirst({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new ActionError("NOT_FOUND", "Block not found");

  await prisma.savedBlock.delete({ where: { id } });

  return { success: true };
}
