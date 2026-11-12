import prisma from '../../utils/db.js';

// Returns null when the constant does not exist, is deleted or belongs to another user.
export const getConstantByIdService = (id: number, userId: number) =>
  prisma.configConstant.findFirst({ where: { id, userId, isDeleted: false } });

// Returns null when the constant does not exist, is deleted or belongs to another user.
export const patchConstantService = async (
  id: number,
  value: number,
  label: string,
  userId: number
) => {
  const { count } = await prisma.configConstant.updateMany({
    where: { id, userId, isDeleted: false },
    data: { value, label },
  });
  if (count === 0) return null;

  return prisma.configConstant.findUniqueOrThrow({ where: { id } });
};
