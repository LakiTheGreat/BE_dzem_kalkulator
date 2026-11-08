import prisma from '../../utils/db.js';

export const getAllFruitsService = (userId: number) =>
  prisma.fruit.findMany({
    where: { isDeleted: false, userId },
    orderBy: { label: 'asc' },
  });

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Returns label if it is free, otherwise "label (n)" with n = highest used
// suffix + 1 (the plain label counts as 1). Only non-deleted fruits of this
// user are considered; excludeId skips the fruit being renamed.
const findFreeLabel = async (
  label: string,
  userId: number,
  excludeId?: number
) => {
  const sameBase = await prisma.fruit.findMany({
    where: {
      userId,
      isDeleted: false,
      label: { startsWith: label },
      ...(excludeId !== undefined && { id: { not: excludeId } }),
    },
    select: { label: true },
  });

  const labels = new Set(sameBase.map((fruit) => fruit.label));
  if (!labels.has(label)) {
    return label;
  }

  const suffixPattern = new RegExp(`^${escapeRegExp(label)} \\((\\d+)\\)$`);
  let highest = 1;
  labels.forEach((existing) => {
    const match = existing.match(suffixPattern);
    if (match) highest = Math.max(highest, Number(match[1]));
  });

  return `${label} (${highest + 1})`;
};

export const createFruitService = async (label: string, userId: number) =>
  prisma.fruit.create({
    data: { label: await findFreeLabel(label, userId), userId },
  });

// Returns null when the fruit does not exist, is deleted or belongs to another user.
export const patchFruitService = async (
  id: number,
  label: string,
  userId: number
) => {
  const fruit = await prisma.fruit.findFirst({
    where: { id, userId, isDeleted: false },
    select: { id: true },
  });
  if (!fruit) return null;

  return prisma.fruit.update({
    where: { id },
    data: { label: await findFreeLabel(label, userId, id) },
  });
};

// Soft delete. Returns null when the fruit does not exist, is already deleted
// or belongs to another user.
export const deleteFruitService = async (id: number, userId: number) => {
  const { count } = await prisma.fruit.updateMany({
    where: { id, userId, isDeleted: false },
    data: { isDeleted: true },
  });
  if (count === 0) return null;

  return prisma.fruit.findUniqueOrThrow({ where: { id } });
};
