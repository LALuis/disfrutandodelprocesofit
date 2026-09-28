import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteObject, getBytes, ref, uploadBytes, uploadString } from 'firebase/storage';
import { ADMIN_TOKEN, createRulesEnvironment, STUDENT_TOKEN } from './helpers';

let env: RulesTestEnvironment;

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);

const asAdmin = () => env.authenticatedContext('admin-1', ADMIN_TOKEN).storage();
const asAlice = () => env.authenticatedContext('alice', STUDENT_TOKEN).storage();
const asBob = () => env.authenticatedContext('bob', STUDENT_TOKEN).storage();
const asAnon = () => env.unauthenticatedContext().storage();

beforeAll(async () => {
  env = await createRulesEnvironment();
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearStorage();
  await env.withSecurityRulesDisabled(async (ctx) => {
    await uploadBytes(ref(ctx.storage(), 'recipes/seed.png'), PNG, { contentType: 'image/png' });
    await uploadBytes(ref(ctx.storage(), 'users/alice/photo.png'), PNG, {
      contentType: 'image/png',
    });
    await uploadString(ref(ctx.storage(), 'other/secret.txt'), 'secret');
  });
});

describe('recipe images', () => {
  it('are publicly readable', async () => {
    await assertSucceeds(getBytes(ref(asAnon(), 'recipes/seed.png')));
  });

  it('are uploaded by admins only, and only as images', async () => {
    await assertSucceeds(
      uploadBytes(ref(asAdmin(), 'recipes/new.png'), PNG, { contentType: 'image/png' }),
    );
    await assertFails(
      uploadString(ref(asAdmin(), 'recipes/notes.txt'), 'x', 'raw', { contentType: 'text/plain' }),
    );
    await assertFails(
      uploadBytes(ref(asAlice(), 'recipes/hack.png'), PNG, { contentType: 'image/png' }),
    );
    await assertFails(
      uploadBytes(ref(asAnon(), 'recipes/hack.png'), PNG, { contentType: 'image/png' }),
    );
    await assertSucceeds(deleteObject(ref(asAdmin(), 'recipes/seed.png')));
  });
});

describe('private student files', () => {
  it('are readable only by the owner and admins', async () => {
    await assertSucceeds(getBytes(ref(asAlice(), 'users/alice/photo.png')));
    await assertSucceeds(getBytes(ref(asAdmin(), 'users/alice/photo.png')));
    await assertFails(getBytes(ref(asBob(), 'users/alice/photo.png')));
    await assertFails(getBytes(ref(asAnon(), 'users/alice/photo.png')));
  });

  it('are written by admins only', async () => {
    await assertSucceeds(
      uploadBytes(ref(asAdmin(), 'users/alice/new.png'), PNG, { contentType: 'image/png' }),
    );
    await assertFails(
      uploadBytes(ref(asAlice(), 'users/alice/new.png'), PNG, { contentType: 'image/png' }),
    );
  });
});

describe('everything else', () => {
  it('is denied even for admins', async () => {
    await assertFails(getBytes(ref(asAdmin(), 'other/secret.txt')));
    await assertFails(uploadString(ref(asAdmin(), 'other/new.txt'), 'x'));
    expect(true).toBe(true);
  });
});
