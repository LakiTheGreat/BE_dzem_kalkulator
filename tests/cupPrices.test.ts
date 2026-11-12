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

const resources = [
  {
    path: 'cupCosts',
    delegate: 'cupCost',
    putKey: 'updatedCupCost',
    delKey: 'deletedCupCost',
    notFound: 'Trošak tegle nije pronađen',
    invalidId: 'Neispravan ID troška',
    inUse: 'Trošak se koristi u aktivnim teglama',
    updated: 'Trošak tegle je izmenjen',
    deleted: 'Trošak tegle je obrisan',
  },
  {
    path: 'cupValues',
    delegate: 'cupValue',
    putKey: 'updatedCupValue',
    delKey: 'deletedCupValue',
    notFound: 'Cena tegle nije pronađena',
    invalidId: 'Neispravan ID cene',
    inUse: 'Cena se koristi u aktivnim teglama',
    updated: 'Cena tegle je izmenjena',
    deleted: 'Cena tegle je obrisana',
  },
] as const;

const createdCupIds: number[] = [];
const created: Record<string, number[]> = { cupCost: [], cupValue: [] };

beforeAll(async () => {
  await assertTestUserExists();
});

afterAll(async () => {
  await prisma.cup.deleteMany({
    where: { id: { in: createdCupIds }, userId: TEST_USER_ID },
  });
  await prisma.cupCost.deleteMany({
    where: { id: { in: created.cupCost }, userId: TEST_USER_ID },
  });
  await prisma.cupValue.deleteMany({
    where: { id: { in: created.cupValue }, userId: TEST_USER_ID },
  });
  await prisma.$disconnect();
});

describe.each(resources)('$path v2', (r) => {
  const url = `/api/v2/${r.path}`;

  const create = async (label: string, value = 10) => {
    const res = await request(app)
      .post(url)
      .set(userHeader)
      .send({ label, value });
    if (res.body.id) created[r.delegate].push(res.body.id);
    return res;
  };
  const put = (id: number | string, body: object) =>
    request(app).put(`${url}/${id}`).set(userHeader).send(body);
  const del = (id: number | string) =>
    request(app).delete(`${url}/${id}`).set(userHeader);

  it('creates a row and returns it (201)', async () => {
    const label = uniqueLabel('new');
    const res = await create(`  ${label}  `, 15);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      label,
      value: 15,
      isDeleted: false,
      userId: TEST_USER_ID,
    });
  });

  it('lists own non-deleted rows sorted by label', async () => {
    const a = await create(uniqueLabel('a_list'));
    const gone = await create(uniqueLabel('b_gone'));
    await del(gone.body.id);

    const res = await request(app).get(url).set(userHeader);

    expect(res.status).toBe(200);
    const ids = res.body.map((x: { id: number }) => x.id);
    expect(ids).toContain(a.body.id);
    expect(ids).not.toContain(gone.body.id);
    expect(res.body.every((x: { userId: number }) => x.userId === TEST_USER_ID)).toBe(
      true
    );
    const labels = res.body.map((x: { label: string }) => x.label);
    expect(labels).toEqual([...labels].sort((x, y) => (x < y ? -1 : 1)));
  });

  it.each([
    [{ label: 'ab', value: 5 }],
    [{ label: '  ab ', value: 5 }],
    [{ label: 'valid label', value: 0 }],
    [{ label: 'valid label', value: 'x' }],
    [{ label: 'valid label' }],
    [{ value: 5 }],
  ])('rejects invalid body %j with 400', async (body) => {
    const res = await request(app).post(url).set(userHeader).send(body);
    expect(res.status).toBe(400);
  });

  it('updates a row', async () => {
    const row = await create(uniqueLabel('upd'));
    const label = uniqueLabel('upd2');

    const res = await put(row.body.id, { label, value: 99 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(r.updated);
    expect(res.body[r.putKey]).toMatchObject({
      id: row.body.id,
      label,
      value: 99,
    });
  });

  it('returns 404 when updating a missing or deleted row', async () => {
    const row = await create(uniqueLabel('updgone'));
    await del(row.body.id);
    const body = { label: uniqueLabel('x'), value: 5 };

    const deleted = await put(row.body.id, body);
    expect(deleted.status).toBe(404);
    expect(deleted.body.message).toBe(r.notFound);

    expect((await put(2147483000, body)).status).toBe(404);
  });

  it('soft-deletes a row and hides it from the list', async () => {
    const row = await create(uniqueLabel('del'));

    const res = await del(row.body.id);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(r.deleted);
    expect(res.body[r.delKey]).toMatchObject({
      id: row.body.id,
      isDeleted: true,
    });

    const list = await request(app).get(url).set(userHeader);
    expect(list.body.some((x: { id: number }) => x.id === row.body.id)).toBe(
      false
    );
  });

  it('returns 404 when deleting a missing or already deleted row', async () => {
    const row = await create(uniqueLabel('twice'));
    await del(row.body.id);

    const again = await del(row.body.id);
    expect(again.status).toBe(404);
    expect(again.body.message).toBe(r.notFound);
    expect((await del(2147483000)).status).toBe(404);
  });

  it('blocks deleting a row that an active cup uses, allows it after the cup is gone', async () => {
    const cost = await prisma.cupCost.create({
      data: { label: uniqueLabel('c'), value: 1, userId: TEST_USER_ID },
    });
    const value = await prisma.cupValue.create({
      data: { label: uniqueLabel('v'), value: 1, userId: TEST_USER_ID },
    });
    created.cupCost.push(cost.id);
    created.cupValue.push(value.id);
    const cup = await prisma.cup.create({
      data: {
        label: uniqueLabel('cup'),
        costId: cost.id,
        valueId: value.id,
        userId: TEST_USER_ID,
      },
    });
    createdCupIds.push(cup.id);
    const targetId = r.delegate === 'cupCost' ? cost.id : value.id;

    const blocked = await del(targetId);
    expect(blocked.status).toBe(400);
    expect(blocked.body.message).toBe(r.inUse);

    await prisma.cup.update({ where: { id: cup.id }, data: { isDeleted: true } });

    expect((await del(targetId)).status).toBe(200);
  });

  it.each(['abc', '0', '-1', '1.5'])('returns 400 for invalid id %s', async (id) => {
    const putRes = await put(id, { label: uniqueLabel('x'), value: 5 });
    expect(putRes.status).toBe(400);
    expect(putRes.body.message).toBe(r.invalidId);

    const delRes = await del(id);
    expect(delRes.status).toBe(400);
    expect(delRes.body.message).toBe(r.invalidId);
  });

  it('rejects an unknown user', async () => {
    const res = await request(app).get(url).set('x-user-id', '999999999');
    expect(res.status).toBe(404);
  });
});
