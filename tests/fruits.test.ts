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

// Same suite is meant to run against every API version (add '/api/v2' later).
describe.each(['/api'])('fruits characterization (%s)', (base) => {
  const url = `${base}/fruits`;
  const createdIds: number[] = [];
  const track = (id: number) => createdIds.push(id);

  beforeAll(async () => {
    await assertTestUserExists();
  });

  afterAll(async () => {
    await prisma.fruit.deleteMany({
      where: { id: { in: createdIds }, userId: TEST_USER_ID },
    });
    await prisma.$disconnect();
  });

  it('rejects requests without a valid user', async () => {
    const res = await request(app).get(url).set('x-user-id', '999999999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'User not found' });
  });

  it('creates a fruit and trims the label', async () => {
    const label = uniqueLabel('create');
    const res = await request(app)
      .post(url)
      .set(userHeader)
      .send({ label: `  ${label}  ` });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      label,
      isDeleted: false,
      userId: TEST_USER_ID,
    });
    track(res.body.id);
  });

  it('returns 400 for a too short label', async () => {
    const res = await request(app).post(url).set(userHeader).send({ label: 'ab' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });

  it('suffixes duplicate labels with (n)', async () => {
    const label = uniqueLabel('dup');
    const first = await request(app).post(url).set(userHeader).send({ label });
    const second = await request(app).post(url).set(userHeader).send({ label });
    const third = await request(app).post(url).set(userHeader).send({ label });
    [first, second, third].forEach((r) => track(r.body.id));

    expect(first.body.label).toBe(label);
    expect(second.body.label).toBe(`${label} (2)`);
    expect(third.body.label).toBe(`${label} (3)`);
  });

  it('lists non-deleted fruits sorted by label', async () => {
    const created = await request(app)
      .post(url)
      .set(userHeader)
      .send({ label: uniqueLabel('list') });
    track(created.body.id);

    const res = await request(app).get(url).set(userHeader);
    expect(res.status).toBe(200);
    expect(res.body.every((f: any) => f.userId === TEST_USER_ID)).toBe(true);
    expect(res.body.every((f: any) => f.isDeleted === false)).toBe(true);
    expect(res.body.some((f: any) => f.id === created.body.id)).toBe(true);
  });

  it('renames a fruit via PATCH', async () => {
    const created = await request(app)
      .post(url)
      .set(userHeader)
      .send({ label: uniqueLabel('patch') });
    track(created.body.id);

    const newLabel = uniqueLabel('patched');
    const res = await request(app)
      .patch(`${url}/${created.body.id}`)
      .set(userHeader)
      .send({ label: newLabel });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: created.body.id, label: newLabel });
  });

  it('returns 400 for a non-numeric id on PATCH', async () => {
    const res = await request(app)
      .patch(`${url}/abc`)
      .set(userHeader)
      .send({ label: 'valid label' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Neispravan ID voća');
  });

  it('soft-deletes a fruit and hides it from the list', async () => {
    const created = await request(app)
      .post(url)
      .set(userHeader)
      .send({ label: uniqueLabel('delete') });
    track(created.body.id);

    const res = await request(app)
      .delete(`${url}/${created.body.id}`)
      .set(userHeader);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Voće je obrisano');
    expect(res.body.fruit).toMatchObject({
      id: created.body.id,
      isDeleted: true,
    });

    const list = await request(app).get(url).set(userHeader);
    expect(list.body.some((f: any) => f.id === created.body.id)).toBe(false);
  });

  it('returns 400 (PRISMA_P2025) when deleting a non-existent fruit', async () => {
    const res = await request(app).delete(`${url}/2147483000`).set(userHeader);
    expect(res.status).toBe(400);
    expect(res.body.customStatusCode).toBe('PRISMA_P2025');
  });
});
