import { describe, it, expect, beforeEach, vi } from 'vitest';
import initSqlJs, { type Database } from 'sql.js';
import {
  CREATE_USERS_TABLE,
  CREATE_CATEGORIES_TABLE,
  CREATE_TASKS_TABLE,
  CREATE_INDEXES,
} from '@taskflow/shared';
import { createCategoryRepository } from '../categoryRepository';

vi.mock('../init', () => ({
  saveDatabase: vi.fn(),
}));

let db: Database;
const USER_A = 1;
const USER_B = 2;

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
  database.run("INSERT INTO users (email, password_hash, salt) VALUES ('a@test.com', 'h', 's')");
  database.run("INSERT INTO users (email, password_hash, salt) VALUES ('b@test.com', 'h', 's')");
  return database;
}

beforeEach(async () => {
  db = await setupDb();
});

describe('categoryRepository', () => {
  describe('CRUD', () => {
    it('create() returns the new category ID', async () => {
      const repo = createCategoryRepository(db);
      const id = await repo.create(USER_A, 'Work', '#E91E63');
      expect(id).toBe(1);
    });

    it('getById() retrieves a created category', async () => {
      const repo = createCategoryRepository(db);
      const id = await repo.create(USER_A, 'Work', '#E91E63');

      const cat = await repo.getById(id, USER_A);
      expect(cat).not.toBeNull();
      expect(cat!.name).toBe('Work');
      expect(cat!.color).toBe('#E91E63');
      expect(cat!.user_id).toBe(USER_A);
    });

    it('getAll() returns all categories for a user', async () => {
      const repo = createCategoryRepository(db);
      await repo.create(USER_A, 'Work', '#E91E63');
      await repo.create(USER_A, 'Personal', '#2196F3');

      const cats = await repo.getAll(USER_A);
      expect(cats).toHaveLength(2);
    });

    it('update() modifies name and color', async () => {
      const repo = createCategoryRepository(db);
      const id = await repo.create(USER_A, 'Work', '#E91E63');

      await repo.update(id, USER_A, 'Office', '#4CAF50');
      const cat = await repo.getById(id, USER_A);
      expect(cat!.name).toBe('Office');
      expect(cat!.color).toBe('#4CAF50');
    });

    it('delete() removes a category', async () => {
      const repo = createCategoryRepository(db);
      const id = await repo.create(USER_A, 'Work', '#E91E63');

      await repo.delete(id, USER_A);
      const cat = await repo.getById(id, USER_A);
      expect(cat).toBeNull();
    });

    it('getById() returns null for non-existent category', async () => {
      const repo = createCategoryRepository(db);
      const cat = await repo.getById(999, USER_A);
      expect(cat).toBeNull();
    });
  });

  describe('user isolation', () => {
    it('user A cannot see user B categories', async () => {
      const repo = createCategoryRepository(db);
      await repo.create(USER_A, 'A-Category', '#E91E63');
      await repo.create(USER_B, 'B-Category', '#2196F3');

      const aCats = await repo.getAll(USER_A);
      expect(aCats).toHaveLength(1);
      expect(aCats[0].name).toBe('A-Category');

      const bCats = await repo.getAll(USER_B);
      expect(bCats).toHaveLength(1);
      expect(bCats[0].name).toBe('B-Category');
    });

    it('getById() respects user scoping', async () => {
      const repo = createCategoryRepository(db);
      const id = await repo.create(USER_A, 'Private', '#E91E63');

      const result = await repo.getById(id, USER_B);
      expect(result).toBeNull();
    });
  });

  describe('ordering', () => {
    it('categories are ordered by name ASC', async () => {
      const repo = createCategoryRepository(db);
      await repo.create(USER_A, 'Zebra', '#000');
      await repo.create(USER_A, 'Alpha', '#000');
      await repo.create(USER_A, 'Middle', '#000');

      const cats = await repo.getAll(USER_A);
      expect(cats.map((c) => c.name)).toEqual(['Alpha', 'Middle', 'Zebra']);
    });
  });
});
