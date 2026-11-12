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

let fruitA = 0;
let fruitB = 0;
let cup1 = 0;
let cup2 = 0;
let costId = 0;
let valueId = 0;

beforeAll(async () => {
  await assertTestUserExists();
  const fa = await prisma.fruit.create({
    data: { label: uniqueLabel('fruitA'), userId: TEST_USER_ID },
  });
  const fb = await prisma.fruit.create({
    data: { label: uniqueLabel('fruitB'), userId: TEST_USER_ID },
  });
  const cost = await prisma.cupCost.create({
    data: { value: 10, label: uniqueLabel('cost'), userId: TEST_USER_ID },
  });
  const value = await prisma.cupValue.create({
    data: { value: 100, label: uniqueLabel('value'), userId: TEST_USER_ID },
  });
  const c1 = await prisma.cup.create({
    data: {
      label: uniqueLabel('cup1'),
      costId: cost.id,
      valueId: value.id,
      userId: TEST_USER_ID,
    },
  });
  const c2 = await prisma.cup.create({
    data: {
      label: uniqueLabel('cup2'),
      costId: cost.id,
      valueId: value.id,
      userId: TEST_USER_ID,
    },
  });
  fruitA = fa.id;
  fruitB = fb.id;
  cup1 = c1.id;
  cup2 = c2.id;
  costId = cost.id;
  valueId = value.id;
});

afterAll(async () => {
  const byFruit = { orderTypeId: { in: [fruitA, fruitB] }, userId: TEST_USER_ID };
  await prisma.inventoryCorrection.deleteMany({ where: byFruit });
  await prisma.transaction.deleteMany({ where: byFruit });
  await prisma.order.deleteMany({ where: byFruit });
  await prisma.cup.deleteMany({ where: { id: { in: [cup1, cup2] } } });
  await prisma.cupCost.deleteMany({ where: { id: costId } });
  await prisma.cupValue.deleteMany({ where: { id: valueId } });
  await prisma.fruit.deleteMany({ where: { id: { in: [fruitA, fruitB] } } });
  await prisma.$disconnect();
});

const base = '/api/v2';

const orderBody = (overrides: Record<string, unknown> = {}) => ({
  orderName: 'test',
  orderTypeId: fruitA,
  baseFruitIsFree: false,
  otherExpensesMargin: 25,
  cups: [
    { id: cup1, label: 'c1', numberOf: 10, cost: 10, sellingPrice: 100, total: 100 },
  ],
  fruits: [{ fruitId: fruitA, grams: '1000', price: '200', total: '200' }],
  ...overrides,
});

const txBody = (overrides: Record<string, unknown> = {}) => ({
  orderTypeId: fruitA,
  status: 'SOLD',
  cupData: [{ cupId: cup1, quantity: 3 }],
  ...overrides,
});

const createOrder = (overrides = {}) =>
  request(app).post(`${base}/orders`).set(userHeader).send(orderBody(overrides));

const createTx = (overrides = {}) =>
  request(app)
    .post(`${base}/transactions`)
    .set(userHeader)
    .send(txBody(overrides));

const stockOf = async (fruitId: number, cupId: number) => {
  const res = await request(app).get(`${base}/inventory`).set(userHeader);
  const fruit = (
    res.body as {
      orderTypeId: number;
      cups: { cupId: number; numberOf: number }[];
    }[]
  ).find((f) => f.orderTypeId === fruitId);

  return fruit?.cups.find((c) => c.cupId === cupId)?.numberOf ?? 0;
};

describe('orders, transactions and inventory v2', () => {
  it('order adds jars to the stock and rejects invalid input', async () => {
    const res = await createOrder();
    expect(res.status).toBe(201);
    expect(res.body.userId).toBeUndefined();
    expect(await stockOf(fruitA, cup1)).toBe(10);

    const bad = [
      { cups: [] },
      { fruits: [] },
      { baseFruitIsFree: 'yes' },
      { otherExpensesMargin: 0 },
      {
        cups: [
          { id: cup1, label: 'c', numberOf: 0, cost: 1, sellingPrice: 1, total: 1 },
        ],
      },
      {
        cups: [
          { id: cup1, label: 'c', numberOf: 1, cost: 1, sellingPrice: 1, total: 1 },
          { id: cup1, label: 'c', numberOf: 1, cost: 1, sellingPrice: 1, total: 1 },
        ],
      },
    ];
    for (const overrides of bad) {
      const r = await createOrder(overrides);
      expect(r.status, JSON.stringify(overrides)).toBe(400);
    }

    expect((await createOrder({ orderTypeId: 999999999 })).status).toBe(404);
  });

  it('transaction takes jars out, stores negative quantity, blocks negative stock', async () => {
    const before = await stockOf(fruitA, cup1);
    const res = await createTx({ cupData: [{ cupId: cup1, quantity: 3 }] });
    expect(res.status).toBe(201);
    expect(res.body.cups[0].quantity).toBe(-3);
    expect(await stockOf(fruitA, cup1)).toBe(before - 3);

    const positive = await createTx({ cupData: [{ cupId: cup1, quantity: -2 }] });
    expect(positive.status).toBe(201);
    expect(positive.body.cups[0].quantity).toBe(-2);

    const tooMany = await createTx({
      cupData: [{ cupId: cup1, quantity: 99999 }],
    });
    expect(tooMany.status).toBe(400);
    expect(tooMany.body.message).toBe('Nema dovoljno tegli na stanju');

    expect(
      (await createTx({ cupData: [{ cupId: cup1, quantity: 0 }] })).status
    ).toBe(400);
  });

  it('changing the fruit of a transaction returns jars to the old fruit', async () => {
    await request(app)
      .post(`${base}/inventory/input`)
      .set(userHeader)
      .send({ orderTypeId: fruitB, cupData: [{ cupId: cup2, quantity: 5 }] })
      .expect(201);
    const tx = await createTx({
      orderTypeId: fruitB,
      cupData: [{ cupId: cup2, quantity: 4 }],
    });
    expect(tx.status).toBe(201);
    expect(await stockOf(fruitB, cup2)).toBe(1);

    const moved = await request(app)
      .put(`${base}/transactions/${tx.body.id}`)
      .set(userHeader)
      .send(txBody({ orderTypeId: fruitA, cupData: [{ cupId: cup2, quantity: 4 }] }));
    // fruitA has no cup2 stock, so the move must be refused and nothing changes
    expect(moved.status).toBe(400);
    expect(await stockOf(fruitB, cup2)).toBe(1);

    await createOrder({
      cups: [
        { id: cup2, label: 'c2', numberOf: 6, cost: 1, sellingPrice: 1, total: 1 },
      ],
    });
    const ok = await request(app)
      .put(`${base}/transactions/${tx.body.id}`)
      .set(userHeader)
      .send(txBody({ orderTypeId: fruitA, cupData: [{ cupId: cup2, quantity: 4 }] }));
    expect(ok.status).toBe(200);
    expect(await stockOf(fruitB, cup2)).toBe(5);
    expect(await stockOf(fruitA, cup2)).toBe(2);
  });

  it('deleting a transaction returns jars; deleting a sold order is blocked', async () => {
    const order = await createOrder({
      orderTypeId: fruitB,
      cups: [
        { id: cup1, label: 'c1', numberOf: 4, cost: 1, sellingPrice: 1, total: 1 },
      ],
    });
    const tx = await createTx({
      orderTypeId: fruitB,
      cupData: [{ cupId: cup1, quantity: 4 }],
    });
    expect(await stockOf(fruitB, cup1)).toBe(0);

    const blocked = await request(app)
      .delete(`${base}/orders/${order.body.id}`)
      .set(userHeader);
    expect(blocked.status).toBe(400);

    await request(app)
      .delete(`${base}/transactions/${tx.body.id}`)
      .set(userHeader)
      .expect(200);
    expect(await stockOf(fruitB, cup1)).toBe(4);

    await request(app)
      .delete(`${base}/orders/${order.body.id}`)
      .set(userHeader)
      .expect(200);
    await request(app)
      .get(`${base}/orders/${order.body.id}`)
      .set(userHeader)
      .expect(404);
    await request(app)
      .delete(`${base}/orders/${order.body.id}`)
      .set(userHeader)
      .expect(404);
  });

  it('PUT order keeps the original otherExpensesMargin', async () => {
    const order = await createOrder({ otherExpensesMargin: 40 });
    const res = await request(app)
      .put(`${base}/orders/${order.body.id}`)
      .set(userHeader)
      .send(orderBody({ otherExpensesMargin: 10 }));
    expect(res.status).toBe(200);
    expect(res.body.otherExpensesMargin).toBe(40);
  });

  it('inventory correction can add and remove but never below zero', async () => {
    const before = await stockOf(fruitB, cup2);
    await request(app)
      .post(`${base}/inventory/input`)
      .set(userHeader)
      .send({ orderTypeId: fruitB, cupData: [{ cupId: cup2, quantity: -2 }] })
      .expect(201);
    expect(await stockOf(fruitB, cup2)).toBe(before - 2);

    const res = await request(app)
      .post(`${base}/inventory/input`)
      .set(userHeader)
      .send({ orderTypeId: fruitB, cupData: [{ cupId: cup2, quantity: -9999 }] });
    expect(res.status).toBe(400);
    expect(await stockOf(fruitB, cup2)).toBe(before - 2);

    const overview = await request(app)
      .get(`${base}/inventory/overview`)
      .set(userHeader);
    expect(overview.status).toBe(200);
    expect(Array.isArray(overview.body)).toBe(true);
  });

  it('list endpoints return the documented shape', async () => {
    const orders = await request(app).get(`${base}/orders`).set(userHeader);
    expect(orders.status).toBe(200);
    expect(orders.body).toHaveProperty('orders');
    expect(orders.body).toHaveProperty('totalCups');

    const txs = await request(app)
      .get(`${base}/transactions?transactionStatus=SOLD`)
      .set(userHeader);
    expect(txs.status).toBe(200);
    // list shows positive quantities (old v1 rows may contain 0)
    expect(
      txs.body.every((t: { cups: { quantity: number }[] }) =>
        t.cups.every((c) => c.quantity >= 0)
      )
    ).toBe(true);

    await request(app)
      .get(`${base}/transactions?transactionStatus=NOPE`)
      .set(userHeader)
      .expect(400);
    await request(app).get(`${base}/orders/abc`).set(userHeader).expect(400);
  });

  it('list filters by fruit and by free/paid base fruit', async () => {
    const free = await createOrder({ baseFruitIsFree: true });
    const paid = await createOrder({ orderTypeId: fruitB });
    const tx = await createTx();
    expect(free.status).toBe(201);
    expect(paid.status).toBe(201);
    expect(tx.status).toBe(201);

    const byFruit = await request(app)
      .get(`${base}/orders?orderTypeId=${fruitB}`)
      .set(userHeader)
      .expect(200);
    expect(byFruit.body.orders.map((o: { id: number }) => o.id)).toEqual([
      paid.body.id,
    ]);

    const onlyFree = await request(app)
      .get(`${base}/orders?orderTypeId=${fruitA}&priceStatus=1`)
      .set(userHeader)
      .expect(200);
    expect(
      onlyFree.body.orders.every(
        (o: { baseFruitIsFree: boolean }) => o.baseFruitIsFree
      )
    ).toBe(true);
    expect(onlyFree.body.orders.map((o: { id: number }) => o.id)).toContain(
      free.body.id
    );

    const txs = await request(app)
      .get(`${base}/transactions?orderTypeId=${fruitA}`)
      .set(userHeader)
      .expect(200);
    expect(txs.body.map((t: { id: number }) => t.id)).toContain(tx.body.id);

    const otherFruit = await request(app)
      .get(`${base}/transactions?orderTypeId=${fruitB}`)
      .set(userHeader)
      .expect(200);
    expect(otherFruit.body.map((t: { id: number }) => t.id)).not.toContain(
      tx.body.id
    );
  });
});
