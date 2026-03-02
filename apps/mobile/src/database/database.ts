import type { SQLiteDatabase } from 'expo-sqlite';
import {
  CREATE_USERS_TABLE,
  CREATE_CATEGORIES_TABLE,
  CREATE_TASKS_TABLE,
  CREATE_INDEXES,
} from '@taskflow/shared';

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync(CREATE_USERS_TABLE);
  await db.execAsync(CREATE_CATEGORIES_TABLE);
  await db.execAsync(CREATE_TASKS_TABLE);
  await db.execAsync(CREATE_INDEXES);
}
