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

const createConstant = async (isDeleted = false) => {
  const row = await prisma.configConstant.create({
    data: {
      value: 10,
      label: uniqueLabel('constant'),
      isDeleted,
      userId: TEST_USER_ID,
    },
  });
  createdIds.push(row.id);
  return row;
};

beforeAll(async () => {
  await assertTestUserExists();
});

afterAll(async () => {
  await prisma.configConstant.deleteMany({
    where: { id: { in: createdIds }, userId: TEST_USER_ID },
  });
  await prisma.$disconnect();
});

describe.each(['/api', '/api/v2'])('%s/constants', (base) => {
  const url = `${base}/constants`;

  it('GET returns the constant', async () => {
    const row = await createConstant();

    const res = await request(app).get(`${url}/${row.id}`).set(userHeader);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: row.id, value: 10, label: row.label });
  });

  it('GET unknown id returns 404', async () => {
    const res = await request(app).get(`${url}/999999999`).set(userHeader);

    expect(res.status).toBe(404);
  });

  it('PATCH updates value and label', async () => {
    const row = await createConstant();

    const res = await request(app)
      .patch(`${url}/${row.id}`)
      .set(userHeader)
      .send({ value: 25, label: '25%' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: row.id, value: 25, label: '25%' });
  });

  it('PATCH unknown id returns 404', async () => {
    const res = await request(app)
      .patch(`${url}/999999999`)
      .set(userHeader)
      .send({ value: 5, label: '5%' });

    expect(res.status).toBe(404);
  });
});

describe('/api/v2/constants fixes', () => {
  const url = '/api/v2/constants';

  it('GET deleted constant returns 404 (v1 returned it)', async () => {
    const row = await createConstant(true);

    const res = await request(app).get(`${url}/${row.id}`).set(userHeader);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Konstanta nije pronađena');
  });

  it('PATCH deleted constant returns 404', async () => {
    const row = await createConstant(true);

    const res = await request(app)
      .patch(`${url}/${row.id}`)
      .set(userHeader)
      .send({ value: 5, label: '5%' });

    expect(res.status).toBe(404);
  });

  it('PATCH ignores isDeleted in the body', async () => {
    const row = await createConstant();

    const res = await request(app)
      .patch(`${url}/${row.id}`)
      .set(userHeader)
      .send({ value: 5, label: '5%', isDeleted: true });

    expect(res.status).toBe(200);
    expect(res.body.isDeleted).toBe(false);
  });

  it.each([0, -1, 1.5, 'abc'])('PATCH rejects value %s with 400', async (v) => {
    const row = await createConstant();

    const res = await request(app)
      .patch(`${url}/${row.id}`)
      .set(userHeader)
      .send({ value: v, label: 'x' });

    expect(res.status).toBe(400);
  });

  it.each(['abc', '0', '1.5'])('rejects invalid id %s with 400', async (id) => {
    const get = await request(app).get(`${url}/${id}`).set(userHeader);
    const patch = await request(app)
      .patch(`${url}/${id}`)
      .set(userHeader)
      .send({ value: 5, label: '5%' });

    expect(get.status).toBe(400);
    expect(get.body.message).toBe('Neispravan ID konstante');
    expect(patch.status).toBe(400);
  });
});
