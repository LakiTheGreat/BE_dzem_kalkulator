import prisma from '../utils/db.js';

export const getConstantByIdService = async (id: number, userId: number) => {
  const constant = await prisma.configConstant.findUnique({
    where: {
      id: Number(id),
      userId,
    },
  });

  return constant;
};

export const patchConstantService = async (
  id: number,
  value: number,
  label: string,
  isDeleted: boolean,
  userId: number
) => {
  const updated = await prisma.configConstant.update({
    where: { id: Number(id), userId },
    data: {
      ...(value !== undefined && { value }),
      ...(label !== undefined && { label }),
      ...(isDeleted !== undefined && { isDeleted }),
    },
  });

  return updated;
};
