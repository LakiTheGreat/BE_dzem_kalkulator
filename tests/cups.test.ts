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

let costId = 0;
let valueId = 0;
let deletedCostId = 0;
const createdCupIds: number[] = [];

beforeAll(async () => {
  await assertTestUserExists();
  const cost = await prisma.cupCost.create({
    data: { label: uniqueLabel('cost'), value: 111, userId: TEST_USER_ID },
  });
  const value = await prisma.cupValue.create({
    data: { label: uniqueLabel('value'), value: 222, userId: TEST_USER_ID },
  });
  const deletedCost = await prisma.cupCost.create({
    data: {
      label: uniqueLabel('delcost'),
      value: 1,
      userId: TEST_USER_ID,
      isDeleted: true,
    },
  });
  costId = cost.id;
  valueId = value.id;
  deletedCostId = deletedCost.id;
});

afterAll(async () => {
  await prisma.cup.deleteMany({
    where: { id: { in: createdCupIds }, userId: TEST_USER_ID },
  });
  await prisma.cupCost.deleteMany({
    where: { id: { in: [costId, deletedCostId] }, userId: TEST_USER_ID },
  });
  await prisma.cupValue.deleteMany({
    where: { id: valueId, userId: TEST_USER_ID },
  });
  await prisma.$disconnect();
});

const createCup = async (base: string, label: string) => {
  const res = await request(app)
    .post(`${base}/cups`)
    .set(userHeader)
    .send({ label, costId, valueId });
  if (res.body.id) createdCupIds.push(res.body.id);
  return res;
};

// Behaviour that must be identical in v1 and v2.
describe.each(['/api', '/api/v2'])('cups shared (%s)', (base) => {
  it('creates a cup with nested cost and selling price', async () => {
    const label = uniqueLabel('cup');
    const res = await createCup(base, label);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ label, costId, valueId, isDeleted: false });
    expect(res.body.cost.value).toBe(111);
    expect(res.body.sellingPrice.value).toBe(222);
  });

  it('lists own non-deleted cups with flat prices, sorted by label', async () => {
    const a = await createCup(base, uniqueLabel('a_list'));
    const gone = await prisma.cup.create({
      data: {
        label: uniqueLabel('gone'),
        costId,
        valueId,
        userId: TEST_USER_ID,
        isDeleted: true,
      },
    });
    createdCupIds.push(gone.id);

    const res = await request(app).get(`${base}/cups`).set(userHeader);

    expect(res.status).toBe(200);
    const ids = res.body.map((c: { id: number }) => c.id);
    expect(ids).toContain(a.body.id);
    expect(ids).not.toContain(gone.id);
    const mine = res.body.find((c: { id: number }) => c.id === a.body.id);
    expect(Object.keys(mine).sort()).toEqual(
      ['cost', 'id', 'isDeleted', 'label', 'sellingPrice'].sort()
    );
    expect(mine.cost).toBe(111);
    expect(mine.sellingPrice).toBe(222);
    const labels = res.body.map((c: { label: string }) => c.label);
    expect(labels).toEqual([...labels].sort((x, y) => (x < y ? -1 : 1)));
  });

  it('rejects an invalid body with 400', async () => {
    const res = await request(app)
      .post(`${base}/cups`)
      .set(userHeader)
      .send({ label: 'ab', costId: 'x' });

    expect(res.status).toBe(400);
  });

  it('rejects an unknown user', async () => {
    const res = await request(app)
      .get(`${base}/cups`)
      .set('x-user-id', '999999999');
    expect(res.status).toBe(404);
  });
});

// Intentional v2 differences / bug fixes.
describe('cups v2 fixes', () => {
  const url = '/api/v2/cups';
  const put = (id: number | string, body: object) =>
    request(app).put(`${url}/${id}`).set(userHeader).send(body);
  const del = (id: number | string) =>
    request(app).delete(`${url}/${id}`).set(userHeader);

  it('trims the label before validating it', async () => {
    const res = await request(app)
      .post(url)
      .set(userHeader)
      .send({ label: '  ab ', costId, valueId });
    expect(res.status).toBe(400);
  });

  it('returns 404 when the cost or price is unknown, deleted or not the user\'s', async () => {
    const label = uniqueLabel('badref');

    const unknownCost = await request(app)
      .post(url)
      .set(userHeader)
      .send({ label, costId: 2147483000, valueId });
    expect(unknownCost.status).toBe(404);
    expect(unknownCost.body.message).toBe('Trošak tegle nije pronađen');

    const deletedCost = await request(app)
      .post(url)
      .set(userHeader)
      .send({ label, costId: deletedCostId, valueId });
    expect(deletedCost.status).toBe(404);

    const unknownValue = await request(app)
      .post(url)
      .set(userHeader)
      .send({ label, costId, valueId: 2147483000 });
    expect(unknownValue.status).toBe(404);
    expect(unknownValue.body.message).toBe('Cena tegle nije pronađena');
  });

  it('updates a cup and keeps the owner', async () => {
    const created = await createCup('/api/v2', uniqueLabel('upd'));
    const label = uniqueLabel('upd2');

    const res = await put(created.body.id, { label, costId, valueId });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Tegla je izmenjena');
    expect(res.body.updatedCup).toMatchObject({ label, userId: TEST_USER_ID });
  });

  it('returns 404 when updating a missing or deleted cup', async () => {
    const created = await createCup('/api/v2', uniqueLabel('updgone'));
    await del(created.body.id);

    const deleted = await put(created.body.id, {
      label: uniqueLabel('x'),
      costId,
      valueId,
    });
    expect(deleted.status).toBe(404);
    expect(deleted.body.message).toBe('Tegla nije pronađena');

    const missing = await put(2147483000, {
      label: uniqueLabel('x'),
      costId,
      valueId,
    });
    expect(missing.status).toBe(404);
  });

  it('soft-deletes a cup and hides it from the list', async () => {
    const created = await createCup('/api/v2', uniqueLabel('del'));

    const res = await del(created.body.id);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Tegla je obrisana');
    expect(res.body.cup).toMatchObject({ id: created.body.id, isDeleted: true });

    const row = await prisma.cup.findUnique({ where: { id: created.body.id } });
    expect(row?.isDeleted).toBe(true);

    const list = await request(app).get(url).set(userHeader);
    expect(list.body.some((c: { id: number }) => c.id === created.body.id)).toBe(
      false
    );
  });

  it('returns 404 when deleting a missing or already deleted cup', async () => {
    const created = await createCup('/api/v2', uniqueLabel('twice'));
    await del(created.body.id);

    expect((await del(created.body.id)).status).toBe(404);
    expect((await del(2147483000)).status).toBe(404);
  });

  it.each(['abc', '0', '-1', '1.5'])('returns 400 for invalid id %s', async (id) => {
    const body = { label: uniqueLabel('x'), costId, valueId };

    const putRes = await put(id, body);
    expect(putRes.status).toBe(400);
    expect(putRes.body.message).toBe('Neispravan ID tegle');

    const delRes = await del(id);
    expect(delRes.status).toBe(400);
    expect(delRes.body.message).toBe('Neispravan ID tegle');
  });
});
