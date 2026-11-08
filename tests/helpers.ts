import 'dotenv/config';

import prisma from '../src/utils/db.js';

// Real data belongs to userId 12397. Tests may only ever act as this user.
export const TEST_USER_ID = 1;

export const userHeader = { 'x-user-id': String(TEST_USER_ID) };

export function uniqueLabel(name: string) {
  return `zz_test_${Date.now()}_${name}`;
}

export async function assertTestUserExists() {
  const user = await prisma.user.findUnique({ where: { id: TEST_USER_ID } });
  if (!user) {
    throw new Error(`Test user ${TEST_USER_ID} does not exist`);
  }
}

export { prisma };
