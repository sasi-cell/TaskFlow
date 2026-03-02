import type { SQLiteDatabase } from 'expo-sqlite';
import type { Category } from '@taskflow/shared';

export function createCategoryRepository(db: SQLiteDatabase) {
  return {
    async getAll(userId: number): Promise<Category[]> {
      return db.getAllAsync<Category>(
        'SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC',
        [userId]
      );
    },

    async getById(id: number, userId: number): Promise<Category | null> {
      return db.getFirstAsync<Category>(
        'SELECT * FROM categories WHERE id = ? AND user_id = ?',
        [id, userId]
      );
    },

    async create(userId: number, name: string, color: string): Promise<number> {
      const result = await db.runAsync(
        'INSERT INTO categories (user_id, name, color) VALUES (?, ?, ?)',
        [userId, name, color]
      );
      return result.lastInsertRowId;
    },

    async update(id: number, userId: number, name: string, color: string): Promise<void> {
      await db.runAsync(
        'UPDATE categories SET name = ?, color = ? WHERE id = ? AND user_id = ?',
        [name, color, id, userId]
      );
    },

    async delete(id: number, userId: number): Promise<void> {
      await db.runAsync(
        'DELETE FROM categories WHERE id = ? AND user_id = ?',
        [id, userId]
      );
    },
  };
}
