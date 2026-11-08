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

// PATCH behaviour that must be identical in v1 and v2.
describe.each(['/api', '/api/v2'])('PATCH fruits shared (%s)', (base) => {
  it('renames a fruit', async () => {
    const fruit = await create(uniqueLabel('p'));
    const newLabel = uniqueLabel('renamed');

    const res = await request(app)
      .patch(`${base}/fruits/${fruit.id}`)
      .set(userHeader)
      .send({ label: newLabel });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: fruit.id, label: newLabel });
  });

  it('suffixes a label that is used by another fruit', async () => {
    const label = uniqueLabel('taken');
    await create(label);
    const other = await create(uniqueLabel('other'));

    const res = await request(app)
      .patch(`${base}/fruits/${other.id}`)
      .set(userHeader)
      .send({ label });

    expect(res.status).toBe(200);
    expect(res.body.label).toBe(`${label} (2)`);
  });

  it('returns 400 for a non-numeric id', async () => {
    const res = await request(app)
      .patch(`${base}/fruits/abc`)
      .set(userHeader)
      .send({ label: 'valid label' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid fruit ID');
  });

  it('returns 400 for a too short label', async () => {
    const fruit = await create(uniqueLabel('short'));
    const res = await request(app)
      .patch(`${base}/fruits/${fruit.id}`)
      .set(userHeader)
      .send({ label: 'ab' });

    expect(res.status).toBe(400);
  });
});

// Intentional v2 differences / bug fixes.
describe('PATCH /api/v2/fruits fixes', () => {
  const url = '/api/v2/fruits';
  const patch = (id: number | string, label: string) =>
    request(app).patch(`${url}/${id}`).set(userHeader).send({ label });

  it('keeps the label when renaming a fruit to its own name', async () => {
    const label = uniqueLabel('self');
    const first = await create(label);
    await create(label);

    const res = await patch(first.id, label);
    expect(res.status).toBe(200);
    expect(res.body.label).toBe(label);
  });

  it('never collides with an existing suffixed label', async () => {
    const label = uniqueLabel('coll');
    const first = await create(label);
    await create(label);

    const res = await patch(first.id, label);
    expect(res.body.label).toBe(label);

    const other = await create(uniqueLabel('x'));
    const renamed = await patch(other.id, label);
    expect(renamed.body.label).toBe(`${label} (3)`);
  });

  it('handles regex special characters in the label', async () => {
    const label = `${uniqueLabel('re')} (x+)[1]`;
    await create(label);
    const other = await create(uniqueLabel('y'));

    const res = await patch(other.id, label);
    expect(res.body.label).toBe(`${label} (2)`);
  });

  it('returns 404 for a deleted fruit and leaves it unchanged', async () => {
    const fruit = await create(uniqueLabel('gone'));
    await request(app).delete(`/api/fruits/${fruit.id}`).set(userHeader);

    const res = await patch(fruit.id, uniqueLabel('after'));
    expect(res.status).toBe(404);

    const row = await prisma.fruit.findUnique({ where: { id: fruit.id } });
    expect(row?.label).toBe(fruit.label);
  });

  it('returns 404 for a non-existent fruit', async () => {
    const res = await patch(2147483000, 'valid label');
    expect(res.status).toBe(404);
  });

  it.each(['0', '-1', '1.5'])('returns 400 for invalid id %s', async (id) => {
    const res = await patch(id, 'valid label');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid fruit ID');
  });

  it('rejects an unknown user', async () => {
    const res = await request(app)
      .patch(`${url}/1`)
      .set('x-user-id', '999999999')
      .send({ label: 'valid label' });
    expect(res.status).toBe(404);
  });
});
