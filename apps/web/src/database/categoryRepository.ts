import type { Database } from 'sql.js';
import type { Category, ICategoryRepository } from '@taskflow/shared';
import { saveDatabase } from './init';

export function createCategoryRepository(db: Database): ICategoryRepository {
  return {
    async getAll(userId: number): Promise<Category[]> {
      const stmt = db.prepare(
        'SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC'
      );
      stmt.bind([userId]);
      const results: Category[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject() as unknown as Category);
      }
      stmt.free();
      return results;
    },

    async getById(id: number, userId: number): Promise<Category | null> {
      const stmt = db.prepare(
        'SELECT * FROM categories WHERE id = ? AND user_id = ?'
      );
      stmt.bind([id, userId]);
      if (stmt.step()) {
        const row = stmt.getAsObject() as unknown as Category;
        stmt.free();
        return row;
      }
      stmt.free();
      return null;
    },

    async create(userId: number, name: string, color: string): Promise<number> {
      db.run(
        'INSERT INTO categories (user_id, name, color) VALUES (?, ?, ?)',
        [userId, name, color]
      );
      const result = db.exec('SELECT last_insert_rowid()');
      saveDatabase(db);
      return result[0].values[0][0] as number;
    },

    async update(id: number, userId: number, name: string, color: string): Promise<void> {
      db.run(
        'UPDATE categories SET name = ?, color = ? WHERE id = ? AND user_id = ?',
        [name, color, id, userId]
      );
      saveDatabase(db);
    },

    async delete(id: number, userId: number): Promise<void> {
      db.run('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
      saveDatabase(db);
    },
  };
}
