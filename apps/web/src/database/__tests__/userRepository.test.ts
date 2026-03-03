import { describe, it, expect, beforeEach, vi } from 'vitest';
import initSqlJs, { type Database } from 'sql.js';
import {
  CREATE_USERS_TABLE,
  CREATE_CATEGORIES_TABLE,
  CREATE_TASKS_TABLE,
  CREATE_INDEXES,
} from '@taskflow/shared';
import { createUserRepository } from '../userRepository';

vi.mock('../init', () => ({
  saveDatabase: vi.fn(),
}));

let db: Database;

async function setupDb() {
  const SQL = await initSqlJs();
  const database = new SQL.Database();
  database.run('PRAGMA foreign_keys = ON;');
  database.run(CREATE_USERS_TABLE);
  database.run(CREATE_CATEGORIES_TABLE);
  database.run(CREATE_TASKS_TABLE);
  CREATE_INDEXES.split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((stmt) => database.run(stmt));
  return database;
}

beforeEach(async () => {
  db = await setupDb();
});

describe('userRepository', () => {
  it('create() returns the new user ID', async () => {
    const repo = createUserRepository(db);
    const id = await repo.create('user@test.com', 'hash123', 'salt123');
    expect(id).toBe(1);
  });

  it('findByEmail() retrieves the created user', async () => {
    const repo = createUserRepository(db);
    await repo.create('user@test.com', 'hash123', 'salt123');

    const user = await repo.findByEmail('user@test.com');
    expect(user).not.toBeNull();
    expect(user!.email).toBe('user@test.com');
    expect(user!.password_hash).toBe('hash123');
    expect(user!.salt).toBe('salt123');
  });

  it('findByEmail() returns null for non-existent user', async () => {
    const repo = createUserRepository(db);
    const user = await repo.findByEmail('nobody@test.com');
    expect(user).toBeNull();
  });

  it('findById() retrieves user without password fields', async () => {
    const repo = createUserRepository(db);
    const id = await repo.create('user@test.com', 'hash123', 'salt123');

    const user = await repo.findById(id);
    expect(user).not.toBeNull();
    expect(user!.id).toBe(id);
    expect(user!.email).toBe('user@test.com');
    expect(user).not.toHaveProperty('password_hash');
    expect(user).not.toHaveProperty('salt');
  });

  it('findById() returns null for non-existent user', async () => {
    const repo = createUserRepository(db);
    const user = await repo.findById(999);
    expect(user).toBeNull();
  });

  it('create() increments IDs for multiple users', async () => {
    const repo = createUserRepository(db);
    const id1 = await repo.create('a@test.com', 'hash', 'salt');
    const id2 = await repo.create('b@test.com', 'hash', 'salt');
    expect(id2).toBeGreaterThan(id1);
  });
});
