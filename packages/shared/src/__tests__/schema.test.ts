import { describe, it, expect } from 'vitest';
import {
  CREATE_USERS_TABLE,
  CREATE_CATEGORIES_TABLE,
  CREATE_TASKS_TABLE,
  CREATE_INDEXES,
} from '../schema';

describe('CREATE_USERS_TABLE', () => {
  it('creates a users table with expected columns', () => {
    expect(CREATE_USERS_TABLE).toContain('CREATE TABLE IF NOT EXISTS users');
    expect(CREATE_USERS_TABLE).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT');
    expect(CREATE_USERS_TABLE).toContain('email TEXT NOT NULL UNIQUE');
    expect(CREATE_USERS_TABLE).toContain('password_hash TEXT NOT NULL');
    expect(CREATE_USERS_TABLE).toContain('salt TEXT NOT NULL');
    expect(CREATE_USERS_TABLE).toContain('created_at TEXT NOT NULL');
  });
});

describe('CREATE_CATEGORIES_TABLE', () => {
  it('creates a categories table with expected columns', () => {
    expect(CREATE_CATEGORIES_TABLE).toContain('CREATE TABLE IF NOT EXISTS categories');
    expect(CREATE_CATEGORIES_TABLE).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT');
    expect(CREATE_CATEGORIES_TABLE).toContain('user_id INTEGER NOT NULL');
    expect(CREATE_CATEGORIES_TABLE).toContain('name TEXT NOT NULL');
    expect(CREATE_CATEGORIES_TABLE).toContain('color TEXT NOT NULL');
  });

  it('has a foreign key to users', () => {
    expect(CREATE_CATEGORIES_TABLE).toContain('FOREIGN KEY (user_id) REFERENCES users(id)');
  });
});

describe('CREATE_TASKS_TABLE', () => {
  it('creates a tasks table with expected columns', () => {
    expect(CREATE_TASKS_TABLE).toContain('CREATE TABLE IF NOT EXISTS tasks');
    expect(CREATE_TASKS_TABLE).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT');
    expect(CREATE_TASKS_TABLE).toContain('user_id INTEGER NOT NULL');
    expect(CREATE_TASKS_TABLE).toContain('title TEXT NOT NULL');
    expect(CREATE_TASKS_TABLE).toContain('description TEXT NOT NULL');
    expect(CREATE_TASKS_TABLE).toContain('status TEXT NOT NULL');
    expect(CREATE_TASKS_TABLE).toContain('priority TEXT NOT NULL');
    expect(CREATE_TASKS_TABLE).toContain('category_id INTEGER');
    expect(CREATE_TASKS_TABLE).toContain('due_date TEXT');
    expect(CREATE_TASKS_TABLE).toContain('created_at TEXT NOT NULL');
    expect(CREATE_TASKS_TABLE).toContain('updated_at TEXT NOT NULL');
  });

  it('has CHECK constraints for status and priority', () => {
    expect(CREATE_TASKS_TABLE).toContain("status IN ('pending', 'completed')");
    expect(CREATE_TASKS_TABLE).toContain("priority IN ('low', 'medium', 'high')");
  });

  it('has foreign keys to users and categories', () => {
    expect(CREATE_TASKS_TABLE).toContain('FOREIGN KEY (user_id) REFERENCES users(id)');
    expect(CREATE_TASKS_TABLE).toContain('FOREIGN KEY (category_id) REFERENCES categories(id)');
  });
});

describe('CREATE_INDEXES', () => {
  it('creates all 4 expected indexes', () => {
    expect(CREATE_INDEXES).toContain('idx_tasks_user_id');
    expect(CREATE_INDEXES).toContain('idx_tasks_status');
    expect(CREATE_INDEXES).toContain('idx_tasks_due_date');
    expect(CREATE_INDEXES).toContain('idx_categories_user_id');
  });
});
