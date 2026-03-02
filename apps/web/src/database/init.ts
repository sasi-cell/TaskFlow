import initSqlJs, { type Database } from 'sql.js';
import {
  CREATE_USERS_TABLE,
  CREATE_CATEGORIES_TABLE,
  CREATE_TASKS_TABLE,
  CREATE_INDEXES,
} from '@taskflow/shared';

const DB_STORAGE_KEY = 'taskflow_db';

export async function initDatabase(): Promise<Database> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });

  const saved = localStorage.getItem(DB_STORAGE_KEY);
  let db: Database;

  if (saved) {
    const buf = Uint8Array.from(atob(saved), (c) => c.charCodeAt(0));
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON;');
  db.run(CREATE_USERS_TABLE);
  db.run(CREATE_CATEGORIES_TABLE);
  db.run(CREATE_TASKS_TABLE);
  CREATE_INDEXES.split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((stmt) => db.run(stmt));

  saveDatabase(db);
  return db;
}

export function saveDatabase(db: Database): void {
  const data = db.export();
  const base64 = btoa(String.fromCharCode(...data));
  localStorage.setItem(DB_STORAGE_KEY, base64);
}
