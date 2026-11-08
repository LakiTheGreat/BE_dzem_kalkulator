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
const post = async (url: string, label: string) => {
  const res = await request(app).post(url).set(userHeader).send({ label });
  if (res.body?.id) createdIds.push(res.body.id);
  return res;
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

// POST behaviour that must be identical in v1 and v2.
describe.each(['/api', '/api/v2'])('POST fruits shared (%s)', (base) => {
  const url = `${base}/fruits`;

  it('creates a fruit and trims the label', async () => {
    const label = uniqueLabel('create');
    const res = await post(url, `  ${label}  `);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      label,
      isDeleted: false,
      userId: TEST_USER_ID,
    });
  });

  it('suffixes duplicates with (n)', async () => {
    const label = uniqueLabel('dup');
    const first = await post(url, label);
    const second = await post(url, label);
    const third = await post(url, label);

    expect(first.body.label).toBe(label);
    expect(second.body.label).toBe(`${label} (2)`);
    expect(third.body.label).toBe(`${label} (3)`);
  });

  it('returns 400 for a too short label', async () => {
    const res = await post(url, 'ab');
    expect(res.status).toBe(400);
  });

  it('returns 400 for a missing label', async () => {
    const res = await request(app).post(url).set(userHeader).send({});
    expect(res.status).toBe(400);
  });
});

// Intentional v2 differences / bug fixes.
describe('POST /api/v2/fruits fixes', () => {
  const url = '/api/v2/fruits';

  it('rejects a label that is too short after trimming', async () => {
    const res = await post(url, '  ab ');
    expect(res.status).toBe(400);
  });

  it('rejects a whitespace-only label', async () => {
    const res = await post(url, '      ');
    expect(res.status).toBe(400);
  });

  it('reports the field as "label" in validation errors', async () => {
    const res = await post(url, 'ab');
    expect(res.body.message).toContain('Field \\"label\\"');
    expect(res.body.message).not.toContain('Field \\"value\\"');
  });

  it('handles regex special characters in the label', async () => {
    const label = `${uniqueLabel('re')} (x+)[1]`;
    const first = await post(url, label);
    const second = await post(url, label);

    expect(first.status).toBe(201);
    expect(first.body.label).toBe(label);
    expect(second.body.label).toBe(`${label} (2)`);
  });

  it('uses the highest suffix + 1 so labels never collide', async () => {
    const label = uniqueLabel('gap');
    await post(url, label);
    const second = await post(url, label);
    await post(url, label);
    await request(app).delete(`/api/fruits/${second.body.id}`).set(userHeader);

    const next = await post(url, label);
    expect(next.body.label).toBe(`${label} (4)`);
  });

  it('does not count deleted fruits when choosing the suffix', async () => {
    const label = uniqueLabel('del');
    const first = await post(url, label);
    await request(app).delete(`/api/fruits/${first.body.id}`).set(userHeader);

    const again = await post(url, label);
    expect(again.body.label).toBe(label);
  });

  it('rejects an unknown user', async () => {
    const res = await request(app)
      .post(url)
      .set('x-user-id', '999999999')
      .send({ label: 'valid label' });
    expect(res.status).toBe(404);
  });
});
