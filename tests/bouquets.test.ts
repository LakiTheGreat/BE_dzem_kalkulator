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

beforeAll(async () => {
  await assertTestUserExists();
});

afterAll(async () => {
  await prisma.bouquetTransaction.deleteMany({
    where: { id: { in: createdIds }, userId: TEST_USER_ID },
  });
  await prisma.$disconnect();
});

const body = (overrides: Record<string, unknown> = {}) => ({
  note: uniqueLabel('bouquet'),
  status: 'SOLD',
  totalExpense: 2000,
  income: 3500,
  profit: 1500,
  profitMargin: 43,
  ...overrides,
});

const create = async (base: string, overrides = {}) => {
  const res = await request(app)
    .post(`${base}/bouquets`)
    .set(userHeader)
    .send(body(overrides));
  if (res.body.id) createdIds.push(res.body.id);
  return res;
};

describe.each(['/api', '/api/v2'])('bouquets %s', (base) => {
  it('creates, reads, lists and updates a transaction', async () => {
    const created = await create(base);
    expect(created.status).toBe(200);
    expect(created.body).toMatchObject({
      status: 'SOLD',
      totalExpense: 2000,
      income: 3500,
      profit: 1500,
      profitMargin: 43,
      isDeleted: false,
    });

    const id = created.body.id;
    const got = await request(app).get(`${base}/bouquets/${id}`).set(userHeader);
    expect(got.status).toBe(200);
    expect(got.body.id).toBe(id);

    const list = await request(app)
      .get(`${base}/bouquets?transactionStatus=SOLD`)
      .set(userHeader);
    expect(list.status).toBe(200);
    expect(list.body.some((b: { id: number }) => b.id === id)).toBe(true);

    const updated = await request(app)
      .put(`${base}/bouquets/${id}`)
      .set(userHeader)
      .send(body({ status: 'GIVEN_AWAY', income: 0, profit: -2000 }));
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({ id, income: 0, profit: -2000 });
  });

  it('rejects invalid body', async () => {
    const res = await create(base, { status: 'NOPE' });
    expect(res.status).toBe(400);
  });

  it('soft-deletes through PUT isDeleted', async () => {
    const { body: created } = await create(base);

    const del = await request(app)
      .put(`${base}/bouquets/${created.id}`)
      .set(userHeader)
      .send(body({ isDeleted: true }));
    expect(del.status).toBe(200);
    expect(del.body.isDeleted).toBe(true);

    const list = await request(app).get(`${base}/bouquets`).set(userHeader);
    expect(list.body.some((b: { id: number }) => b.id === created.id)).toBe(
      false
    );
  });
});

describe('bouquets v2 fixes', () => {
  const base = '/api/v2';

  it('does not expose userId and returns the same shape from POST, GET and PUT', async () => {
    const created = await create(base);
    const id = created.body.id;
    const got = await request(app).get(`${base}/bouquets/${id}`).set(userHeader);
    const put = await request(app)
      .put(`${base}/bouquets/${id}`)
      .set(userHeader)
      .send(body());

    expect(created.body).not.toHaveProperty('userId');
    expect(put.body.status).toBe('SOLD');
    expect(Object.keys(got.body).sort()).toEqual(
      Object.keys(created.body).sort()
    );
    expect(Object.keys(put.body).sort()).toEqual(
      Object.keys(created.body).sort()
    );
  });

  it('treats deleted rows as not found for GET and PUT', async () => {
    const { body: created } = await create(base);
    await request(app)
      .put(`${base}/bouquets/${created.id}`)
      .set(userHeader)
      .send(body({ isDeleted: true }));

    const got = await request(app)
      .get(`${base}/bouquets/${created.id}`)
      .set(userHeader);
    expect(got.status).toBe(404);

    const restore = await request(app)
      .put(`${base}/bouquets/${created.id}`)
      .set(userHeader)
      .send(body({ isDeleted: false }));
    expect(restore.status).toBe(404);
  });

  it('returns 404 for a missing id and 400 for an invalid id', async () => {
    const missing = await request(app)
      .put(`${base}/bouquets/2147483647`)
      .set(userHeader)
      .send(body());
    expect(missing.status).toBe(404);

    const invalid = await request(app)
      .get(`${base}/bouquets/abc`)
      .set(userHeader);
    expect(invalid.status).toBe(400);
  });

  it('rejects an unknown transactionStatus with 400', async () => {
    const res = await request(app)
      .get(`${base}/bouquets?transactionStatus=NOPE`)
      .set(userHeader);
    expect(res.status).toBe(400);
  });
});
