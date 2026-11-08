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

const createdIds: number[] = [];
const create = async (label: string) => {
  const res = await request(app)
    .post('/api/v2/fruits')
    .set(userHeader)
    .send({ label });
  createdIds.push(res.body.id);
  return res.body as { id: number; label: string };
};

beforeAll(async () => {
  await assertTestUserExists();
});

afterAll(async () => {
  await prisma.fruit.deleteMany({
    where: { id: { in: createdIds }, userId: TEST_USER_ID },
  });
  await prisma.$disconnect();
});

// DELETE behaviour that must be identical in v1 and v2.
describe.each(['/api', '/api/v2'])('DELETE fruits shared (%s)', (base) => {
  it('soft-deletes a fruit and hides it from the list', async () => {
    const fruit = await create(uniqueLabel('del'));

    const res = await request(app)
      .delete(`${base}/fruits/${fruit.id}`)
      .set(userHeader);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Fruit marked as soft-deleted');
    expect(res.body.fruit).toMatchObject({ id: fruit.id, isDeleted: true });

    const list = await request(app).get(`${base}/fruits`).set(userHeader);
    expect(list.body.some((f: { id: number }) => f.id === fruit.id)).toBe(false);
  });

  it('returns 400 for a non-numeric id', async () => {
    const res = await request(app).delete(`${base}/fruits/abc`).set(userHeader);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid fruit ID');
  });
});

// Intentional v2 differences / bug fixes.
describe('DELETE /api/v2/fruits fixes', () => {
  const url = '/api/v2/fruits';
  const del = (id: number | string) =>
    request(app).delete(`${url}/${id}`).set(userHeader);

  it('keeps the row in the database (soft delete)', async () => {
    const fruit = await create(uniqueLabel('soft'));
    await del(fruit.id);

    const row = await prisma.fruit.findUnique({ where: { id: fruit.id } });
    expect(row?.isDeleted).toBe(true);
  });

  it('returns 404 when deleting an already deleted fruit', async () => {
    const fruit = await create(uniqueLabel('twice'));
    await del(fruit.id);

    const res = await del(fruit.id);
    expect(res.status).toBe(404);
  });

  it('returns 404 for a non-existent fruit', async () => {
    const res = await del(2147483000);
    expect(res.status).toBe(404);
  });

  it.each(['0', '-1', '1.5'])('returns 400 for invalid id %s', async (id) => {
    const res = await del(id);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid fruit ID');
  });

  it('rejects an unknown user', async () => {
    const res = await request(app)
      .delete(`${url}/1`)
      .set('x-user-id', '999999999');
    expect(res.status).toBe(404);
  });
});
