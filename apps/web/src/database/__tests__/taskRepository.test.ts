import { describe, it, expect, beforeEach, vi } from 'vitest';
import initSqlJs, { type Database } from 'sql.js';
import {
  CREATE_USERS_TABLE,
  CREATE_CATEGORIES_TABLE,
  CREATE_TASKS_TABLE,
  CREATE_INDEXES,
} from '@taskflow/shared';
import { createTaskRepository } from '../taskRepository';

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
  // Create two users for isolation tests
  database.run("INSERT INTO users (email, password_hash, salt) VALUES ('a@test.com', 'h', 's')");
  database.run("INSERT INTO users (email, password_hash, salt) VALUES ('b@test.com', 'h', 's')");
  return database;
}

beforeEach(async () => {
  db = await setupDb();
});

describe('taskRepository', () => {
  describe('CRUD', () => {
    it('create() returns a task ID', async () => {
      const repo = createTaskRepository(db);
      const id = await repo.create(USER_A, {
        title: 'Test Task',
        description: 'Desc',
        priority: 'medium',
        category_id: null,
        due_date: null,
      });
      expect(id).toBe(1);
    });

    it('getById() retrieves a created task', async () => {
      const repo = createTaskRepository(db);
      const id = await repo.create(USER_A, {
        title: 'Test Task',
        description: 'Desc',
        priority: 'high',
        category_id: null,
        due_date: '2026-12-31',
      });

      const task = await repo.getById(id, USER_A);
      expect(task).not.toBeNull();
      expect(task!.title).toBe('Test Task');
      expect(task!.description).toBe('Desc');
      expect(task!.priority).toBe('high');
      expect(task!.status).toBe('pending');
      expect(task!.due_date).toBe('2026-12-31');
    });

    it('getAll() returns all tasks for a user', async () => {
      const repo = createTaskRepository(db);
      await repo.create(USER_A, { title: 'Task 1', description: '', priority: 'low', category_id: null, due_date: null });
      await repo.create(USER_A, { title: 'Task 2', description: '', priority: 'high', category_id: null, due_date: null });

      const tasks = await repo.getAll(USER_A);
      expect(tasks).toHaveLength(2);
    });

    it('update() modifies task fields', async () => {
      const repo = createTaskRepository(db);
      const id = await repo.create(USER_A, { title: 'Original', description: '', priority: 'low', category_id: null, due_date: null });

      await repo.update(id, USER_A, { title: 'Updated', priority: 'high' });
      const task = await repo.getById(id, USER_A);
      expect(task!.title).toBe('Updated');
      expect(task!.priority).toBe('high');
    });

    it('delete() removes a task', async () => {
      const repo = createTaskRepository(db);
      const id = await repo.create(USER_A, { title: 'To Delete', description: '', priority: 'low', category_id: null, due_date: null });

      await repo.delete(id, USER_A);
      const task = await repo.getById(id, USER_A);
      expect(task).toBeNull();
    });

    it('getById() returns null for non-existent task', async () => {
      const repo = createTaskRepository(db);
      const task = await repo.getById(999, USER_A);
      expect(task).toBeNull();
    });
  });

  describe('toggleStatus', () => {
    it('flips pending to completed', async () => {
      const repo = createTaskRepository(db);
      const id = await repo.create(USER_A, { title: 'Toggle', description: '', priority: 'medium', category_id: null, due_date: null });

      await repo.toggleStatus(id, USER_A);
      const task = await repo.getById(id, USER_A);
      expect(task!.status).toBe('completed');
    });

    it('flips completed back to pending', async () => {
      const repo = createTaskRepository(db);
      const id = await repo.create(USER_A, { title: 'Toggle', description: '', priority: 'medium', category_id: null, due_date: null });

      await repo.toggleStatus(id, USER_A);
      await repo.toggleStatus(id, USER_A);
      const task = await repo.getById(id, USER_A);
      expect(task!.status).toBe('pending');
    });
  });

  describe('filtering', () => {
    it('filters by status', async () => {
      const repo = createTaskRepository(db);
      const id1 = await repo.create(USER_A, { title: 'T1', description: '', priority: 'low', category_id: null, due_date: null });
      await repo.create(USER_A, { title: 'T2', description: '', priority: 'low', category_id: null, due_date: null });
      await repo.toggleStatus(id1, USER_A);

      const completed = await repo.getAll(USER_A, { status: 'completed' });
      expect(completed).toHaveLength(1);
      expect(completed[0].title).toBe('T1');

      const pending = await repo.getAll(USER_A, { status: 'pending' });
      expect(pending).toHaveLength(1);
      expect(pending[0].title).toBe('T2');
    });

    it('filters by priority', async () => {
      const repo = createTaskRepository(db);
      await repo.create(USER_A, { title: 'Low', description: '', priority: 'low', category_id: null, due_date: null });
      await repo.create(USER_A, { title: 'High', description: '', priority: 'high', category_id: null, due_date: null });

      const high = await repo.getAll(USER_A, { priority: 'high' });
      expect(high).toHaveLength(1);
      expect(high[0].title).toBe('High');
    });

    it('filters by category', async () => {
      const repo = createTaskRepository(db);
      db.run("INSERT INTO categories (user_id, name, color) VALUES (?, 'Work', '#000')", [USER_A]);
      const catId = (db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number);

      await repo.create(USER_A, { title: 'Categorized', description: '', priority: 'low', category_id: catId, due_date: null });
      await repo.create(USER_A, { title: 'No Category', description: '', priority: 'low', category_id: null, due_date: null });

      const filtered = await repo.getAll(USER_A, { category_id: catId });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Categorized');
    });

    it('filters by search term', async () => {
      const repo = createTaskRepository(db);
      await repo.create(USER_A, { title: 'Buy groceries', description: '', priority: 'low', category_id: null, due_date: null });
      await repo.create(USER_A, { title: 'Clean house', description: 'weekly cleaning', priority: 'low', category_id: null, due_date: null });

      const results = await repo.getAll(USER_A, { search: 'clean' });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Clean house');
    });
  });

  describe('sorting', () => {
    it('sorts by created_at descending by default', async () => {
      const repo = createTaskRepository(db);
      // Insert with explicit timestamps to guarantee ordering
      db.run(
        "INSERT INTO tasks (user_id, title, description, priority, status, created_at, updated_at) VALUES (?, 'First', '', 'low', 'pending', '2026-01-01 00:00:00', '2026-01-01 00:00:00')",
        [USER_A]
      );
      db.run(
        "INSERT INTO tasks (user_id, title, description, priority, status, created_at, updated_at) VALUES (?, 'Second', '', 'low', 'pending', '2026-01-02 00:00:00', '2026-01-02 00:00:00')",
        [USER_A]
      );

      const tasks = await repo.getAll(USER_A);
      // Default sort is created_at desc — most recent first
      expect(tasks[0].title).toBe('Second');
      expect(tasks[1].title).toBe('First');
    });

    it('sorts by due_date ascending', async () => {
      const repo = createTaskRepository(db);
      await repo.create(USER_A, { title: 'Later', description: '', priority: 'low', category_id: null, due_date: '2026-12-31' });
      await repo.create(USER_A, { title: 'Sooner', description: '', priority: 'low', category_id: null, due_date: '2026-01-01' });

      const tasks = await repo.getAll(USER_A, { sort_by: 'due_date', sort_order: 'asc' });
      expect(tasks[0].title).toBe('Sooner');
      expect(tasks[1].title).toBe('Later');
    });

    it('sorts by priority', async () => {
      const repo = createTaskRepository(db);
      await repo.create(USER_A, { title: 'Medium', description: '', priority: 'medium', category_id: null, due_date: null });
      await repo.create(USER_A, { title: 'High', description: '', priority: 'high', category_id: null, due_date: null });
      await repo.create(USER_A, { title: 'Low', description: '', priority: 'low', category_id: null, due_date: null });

      const tasks = await repo.getAll(USER_A, { sort_by: 'priority', sort_order: 'asc' });
      expect(tasks.map((t) => t.priority)).toEqual(['high', 'low', 'medium']);
    });
  });

  describe('user isolation', () => {
    it('user A cannot see user B tasks', async () => {
      const repo = createTaskRepository(db);
      await repo.create(USER_A, { title: 'A task', description: '', priority: 'low', category_id: null, due_date: null });
      await repo.create(USER_B, { title: 'B task', description: '', priority: 'low', category_id: null, due_date: null });

      const aTasks = await repo.getAll(USER_A);
      expect(aTasks).toHaveLength(1);
      expect(aTasks[0].title).toBe('A task');

      const bTasks = await repo.getAll(USER_B);
      expect(bTasks).toHaveLength(1);
      expect(bTasks[0].title).toBe('B task');
    });

    it('getById() respects user scoping', async () => {
      const repo = createTaskRepository(db);
      const id = await repo.create(USER_A, { title: 'Private', description: '', priority: 'low', category_id: null, due_date: null });

      const result = await repo.getById(id, USER_B);
      expect(result).toBeNull();
    });
  });
});
