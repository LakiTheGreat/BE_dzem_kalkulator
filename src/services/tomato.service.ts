import prisma from '../utils/db.js';

export async function getAllTomatoCupsService(whereClause: any) {
  return prisma.tomatoCup.findMany({
    where: {
      ...whereClause,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      label: true,
    },
  });
}
