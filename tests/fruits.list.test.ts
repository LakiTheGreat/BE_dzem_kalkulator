import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import app from '../src/app.js';
import {
  TEST_USER_ID,
  assertTestUserExists,
  prisma,
  uniqueLabel,
  userHeader,
} from './helpers.js';

// GET list must behave identically in v1 and v2.
describe.each(['/api', '/api/v2'])('GET fruits list (%s)', (base) => {
  const url = `${base}/fruits`;
  const createdIds: number[] = [];

  beforeAll(async () => {
    await assertTestUserExists();
  });

  afterAll(async () => {
    await prisma.fruit.deleteMany({
      where: { id: { in: createdIds }, userId: TEST_USER_ID },
    });
    await prisma.$disconnect();
  });

  it('rejects an unknown user', async () => {
    const res = await request(app).get(url).set('x-user-id', '999999999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'User not found' });
  });

  it('rejects a missing user header', async () => {
    const res = await request(app).get(url);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'No user ID provided' });
  });

  it('returns only own, non-deleted fruits sorted by label', async () => {
    const prefix = uniqueLabel('');
    const kept = await prisma.fruit.create({
      data: { label: `${prefix}b_kept`, userId: TEST_USER_ID },
    });
    const first = await prisma.fruit.create({
      data: { label: `${prefix}a_kept`, userId: TEST_USER_ID },
    });
    const deleted = await prisma.fruit.create({
      data: {
        label: `${prefix}c_deleted`,
        userId: TEST_USER_ID,
        isDeleted: true,
      },
    });
    createdIds.push(kept.id, first.id, deleted.id);

    const res = await request(app).get(url).set(userHeader);

    expect(res.status).toBe(200);
    expect(res.body.every((f: any) => f.userId === TEST_USER_ID)).toBe(true);
    expect(res.body.every((f: any) => f.isDeleted === false)).toBe(true);
    const ids = res.body.map((f: any) => f.id);
    expect(ids).toContain(kept.id);
    expect(ids).not.toContain(deleted.id);
    expect(ids.indexOf(first.id)).toBeLessThan(ids.indexOf(kept.id));
    expect(Object.keys(res.body[0]).sort()).toEqual(
      ['id', 'isDeleted', 'label', 'userId'].sort()
    );
  });
});
