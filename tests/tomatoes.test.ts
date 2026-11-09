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

let cupA = 0;
let cupB = 0;
let cupC = 0;

beforeAll(async () => {
  await assertTestUserExists();
  const a = await prisma.tomatoCup.create({
    data: { label: uniqueLabel('cupA'), userId: TEST_USER_ID },
  });
  const b = await prisma.tomatoCup.create({
    data: { label: uniqueLabel('cupB'), userId: TEST_USER_ID },
  });
  const c = await prisma.tomatoCup.create({
    data: { label: uniqueLabel('cupC'), userId: TEST_USER_ID },
  });
  cupA = a.id;
  cupB = b.id;
  cupC = c.id;
});

afterAll(async () => {
  const where = {
    cupTypeId: { in: [cupA, cupB, cupC] },
    userId: TEST_USER_ID,
  };
  await prisma.tomatoOrderTransaction.deleteMany({ where });
  await prisma.tomatoOrder.deleteMany({ where });
  await prisma.tomatoCup.deleteMany({
    where: { id: { in: [cupA, cupB, cupC] }, userId: TEST_USER_ID },
  });
  await prisma.$disconnect();
});

const api = (base: string) => `${base}/tomatoes`;

const createOrder = async (
  base: string,
  body: Partial<{ cupTypeId: number; totalExpenses: number; numOfCups: number }> = {}
) =>
  request(app)
    .post(api(base))
    .set(userHeader)
    .send({ cupTypeId: cupA, totalExpenses: 100, numOfCups: 10, ...body });

const createTx = async (
  base: string,
  body: Partial<{
    cupTypeId: number;
    numOfCups: number;
    pricePerCup: number;
    status: string;
    note: string;
  }> = {}
) =>
  request(app)
    .post(`${api(base)}/transactions`)
    .set(userHeader)
    .send({
      cupTypeId: cupA,
      numOfCups: 3,
      pricePerCup: 500,
      status: 'SOLD',
      note: '',
      ...body,
    });

const stockOf = async (base: string, cupTypeId: number) => {
  const res = await request(app).get(`${api(base)}/totals`).set(userHeader);
  return (res.body as { cupTypeId: number; totalCups: number }[]).find(
    (t) => t.cupTypeId === cupTypeId
  );
};

// Behaviour that must be identical in v1 and v2.
describe.each(['/api', '/api/v2'])('tomatoes shared (%s)', (base) => {
  it('lists the user cups', async () => {
    const res = await request(app).get(`${api(base)}/cups`).set(userHeader);

    expect(res.status).toBe(200);
    expect(res.body.some((c: { id: number }) => c.id === cupA)).toBe(true);
  });

  it('order -> stock -> transaction -> stock lifecycle', async () => {
    const before = (await stockOf(base, cupB))?.totalCups ?? 0;

    const order = await createOrder(base, { cupTypeId: cupB, numOfCups: 10 });
    expect(order.status).toBe(200);
    expect(order.body).toMatchObject({ cupTypeId: cupB, numOfCups: 10 });

    const list = await request(app).get(api(base)).set(userHeader);
    const listed = list.body.find((o: { id: number }) => o.id === order.body.id);
    expect(listed.label).toBeTypeOf('string');

    const byId = await request(app)
      .get(`${api(base)}/${order.body.id}`)
      .set(userHeader);
    expect(byId.status).toBe(200);

    expect((await stockOf(base, cupB))?.totalCups).toBe(before + 10);

    const tx = await createTx(base, { cupTypeId: cupB, numOfCups: 4 });
    expect(tx.status).toBe(201);
    expect(tx.body).toMatchObject({ cupTypeId: cupB, numOfCups: 4 });
    expect(tx.body.cupTypeLabel).toBeTypeOf('string');
    expect((await stockOf(base, cupB))?.totalCups).toBe(before + 6);

    const delTx = await request(app)
      .delete(`${api(base)}/transactions/${tx.body.id}`)
      .set(userHeader);
    expect(delTx.status).toBe(200);
    expect(delTx.body.isDeleted).toBe(true);
    expect((await stockOf(base, cupB))?.totalCups).toBe(before + 10);

    const delOrder = await request(app)
      .delete(`${api(base)}/${order.body.id}`)
      .set(userHeader);
    expect(delOrder.status).toBe(200);
    expect((await stockOf(base, cupB))?.totalCups ?? 0).toBe(before);
  });

  it('lists transactions with a label and filters by status', async () => {
    await createOrder(base, { numOfCups: 5 });
    const tx = await createTx(base, { numOfCups: 1, status: 'GIVEN_AWAY' });

    const res = await request(app)
      .get(`${api(base)}/transactions?transactionStatus=GIVEN_AWAY`)
      .set(userHeader);

    expect(res.status).toBe(200);
    const found = res.body.find((t: { id: number }) => t.id === tx.body.id);
    expect(found.label).toBeTypeOf('string');
    expect(res.body.every((t: { status: string }) => t.status === 'GIVEN_AWAY')).toBe(
      true
    );
  });

  it('updates a transaction', async () => {
    await createOrder(base, { numOfCups: 5 });
    const tx = await createTx(base, { numOfCups: 1 });

    const res = await request(app)
      .put(`${api(base)}/transactions/${tx.body.id}`)
      .set(userHeader)
      .send({
        cupTypeId: cupA,
        numOfCups: 2,
        pricePerCup: 700,
        status: 'SOLD',
        note: 'changed',
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ numOfCups: 2, pricePerCup: 700, note: 'changed' });
  });

  it('rejects an invalid order body', async () => {
    const res = await request(app)
      .post(api(base))
      .set(userHeader)
      .send({ cupTypeId: cupA, totalExpenses: -1, numOfCups: 0 });

    expect(res.status).toBe(400);
  });
});

// Intentional v2 differences / bug fixes.
describe('tomatoes v2 fixes', () => {
  const base = '/api/v2';

  it('updates totalExpenses and cupTypeId of an order (v1 ignored them)', async () => {
    const order = await createOrder(base, { numOfCups: 5, totalExpenses: 100 });

    const res = await request(app)
      .put(`${api(base)}/${order.body.id}`)
      .set(userHeader)
      .send({ cupTypeId: cupB, totalExpenses: 250, numOfCups: 6 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      cupTypeId: cupB,
      totalExpenses: 250,
      numOfCups: 6,
    });
  });

  it('returns 404 for an unknown cup type on create', async () => {
    const order = await createOrder(base, { cupTypeId: 2147483000 });
    expect(order.status).toBe(404);

    const tx = await createTx(base, { cupTypeId: 2147483000 });
    expect(tx.status).toBe(404);
  });

  it('blocks selling more cups than in stock and leaves stock unchanged', async () => {
    const order = await createOrder(base, { cupTypeId: cupB, numOfCups: 2 });
    const before = (await stockOf(base, cupB))?.totalCups ?? 0;

    const tx = await createTx(base, { cupTypeId: cupB, numOfCups: before + 1 });

    expect(tx.status).toBe(400);
    expect(tx.body.message).toBe('Not enough cups in stock');
    expect((await stockOf(base, cupB))?.totalCups).toBe(before);

    await request(app).delete(`${api(base)}/${order.body.id}`).set(userHeader);
  });

  it('blocks shrinking or deleting an order that stock already sold', async () => {
    const before = (await stockOf(base, cupC))?.totalCups ?? 0;
    const order = await createOrder(base, { cupTypeId: cupC, numOfCups: 5 });
    await createTx(base, { cupTypeId: cupC, numOfCups: 5 });

    const shrink = await request(app)
      .put(`${api(base)}/${order.body.id}`)
      .set(userHeader)
      .send({ cupTypeId: cupC, totalExpenses: 100, numOfCups: 1 });
    expect(shrink.status).toBe(400);

    const del = await request(app)
      .delete(`${api(base)}/${order.body.id}`)
      .set(userHeader);
    expect(del.status).toBe(400);

    expect((await stockOf(base, cupC))?.totalCups).toBe(before);
  });

  it('blocks raising a transaction above stock', async () => {
    await createOrder(base, { numOfCups: 5 });
    const tx = await createTx(base, { numOfCups: 1 });
    const stock = (await stockOf(base, cupA))?.totalCups ?? 0;

    const res = await request(app)
      .put(`${api(base)}/transactions/${tx.body.id}`)
      .set(userHeader)
      .send({
        cupTypeId: cupA,
        numOfCups: 1 + stock + 1,
        pricePerCup: 1,
        status: 'SOLD',
        note: '',
      });

    expect(res.status).toBe(400);
  });

  it('returns 404 for deleted or missing rows and 400 for bad ids', async () => {
    const order = await createOrder(base, { numOfCups: 2 });
    await request(app).delete(`${api(base)}/${order.body.id}`).set(userHeader);

    for (const res of [
      await request(app).get(`${api(base)}/${order.body.id}`).set(userHeader),
      await request(app).delete(`${api(base)}/${order.body.id}`).set(userHeader),
      await request(app).get(`${api(base)}/2147483000`).set(userHeader),
      await request(app)
        .put(`${api(base)}/${order.body.id}`)
        .set(userHeader)
        .send({ cupTypeId: cupA, totalExpenses: 1, numOfCups: 1 }),
      await request(app)
        .get(`${api(base)}/transactions/2147483000`)
        .set(userHeader),
      await request(app)
        .delete(`${api(base)}/transactions/2147483000`)
        .set(userHeader),
    ]) {
      expect(res.status).toBe(404);
    }

    for (const path of ['abc', '0', '-1', '1.5']) {
      const res = await request(app).get(`${api(base)}/${path}`).set(userHeader);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid ID');
    }
  });

  it('totals include a cup type that only has transactions', async () => {
    const cup = await prisma.tomatoCup.create({
      data: { label: uniqueLabel('only_tx'), userId: TEST_USER_ID },
    });
    const order = await prisma.tomatoOrder.create({
      data: { cupTypeId: cup.id, totalExpenses: 1, numOfCups: 3, userId: TEST_USER_ID },
    });
    await createTx(base, { cupTypeId: cup.id, numOfCups: 3 });
    await prisma.tomatoOrder.delete({ where: { id: order.id } });

    const total = await stockOf(base, cup.id);

    await prisma.tomatoOrderTransaction.deleteMany({ where: { cupTypeId: cup.id } });
    await prisma.tomatoCup.delete({ where: { id: cup.id } });

    expect(total).toMatchObject({
      totalOrdered: 0,
      totalUsedInTransactions: 3,
      totalCups: -3,
    });
    expect(total).toHaveProperty('label');
  });

  it('validates year, month and transactionStatus filters', async () => {
    for (const query of [
      'year=abc',
      'month=13',
      'month=-1',
    ]) {
      const res = await request(app).get(`${api(base)}?${query}`).set(userHeader);
      expect(res.status).toBe(400);
    }

    const bad = await request(app)
      .get(`${api(base)}/transactions?transactionStatus=NOPE`)
      .set(userHeader);
    expect(bad.status).toBe(400);
  });

  it('applies the year/month filter and treats 0 as no filter', async () => {
    const order = await createOrder(base, { numOfCups: 2 });
    const now = new Date();

    const ids = async (query: string) =>
      (
        await request(app).get(`${api(base)}?${query}`).set(userHeader)
      ).body.map((o: { id: number }) => o.id);

    expect(await ids(`year=${now.getFullYear()}&month=${now.getMonth() + 1}`)).toContain(
      order.body.id
    );
    expect(await ids('year=1999')).not.toContain(order.body.id);
    expect(await ids('year=0&month=0')).toContain(order.body.id);
  });

  it('rejects an unknown user', async () => {
    const res = await request(app)
      .get(`${api(base)}/totals`)
      .set('x-user-id', '999999999');
    expect(res.status).toBe(404);
  });
});
