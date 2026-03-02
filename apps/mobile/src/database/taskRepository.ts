import type { SQLiteDatabase } from 'expo-sqlite';
import type { Task, TaskWithCategory, TaskFilter } from '@taskflow/shared';

export function createTaskRepository(db: SQLiteDatabase) {
  return {
    async getAll(userId: number, filter?: TaskFilter): Promise<TaskWithCategory[]> {
      let query = `
        SELECT t.*, c.name as category_name, c.color as category_color
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ?
      `;
      const params: (string | number)[] = [userId];

      if (filter?.status) {
        query += ' AND t.status = ?';
        params.push(filter.status);
      }
      if (filter?.priority) {
        query += ' AND t.priority = ?';
        params.push(filter.priority);
      }
      if (filter?.category_id) {
        query += ' AND t.category_id = ?';
        params.push(filter.category_id);
      }
      if (filter?.search) {
        query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
        const term = `%${filter.search}%`;
        params.push(term, term);
      }

      const sortBy = filter?.sort_by ?? 'created_at';
      const sortOrder = filter?.sort_order ?? 'desc';
      query += ` ORDER BY t.${sortBy} ${sortOrder}`;

      return db.getAllAsync<TaskWithCategory>(query, params);
    },

    async getById(id: number, userId: number): Promise<TaskWithCategory | null> {
      return db.getFirstAsync<TaskWithCategory>(
        `SELECT t.*, c.name as category_name, c.color as category_color
         FROM tasks t
         LEFT JOIN categories c ON t.category_id = c.id
         WHERE t.id = ? AND t.user_id = ?`,
        [id, userId]
      );
    },

    async create(
      userId: number,
      task: Pick<Task, 'title' | 'description' | 'priority' | 'category_id' | 'due_date'>
    ): Promise<number> {
      const result = await db.runAsync(
        `INSERT INTO tasks (user_id, title, description, priority, category_id, due_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, task.title, task.description, task.priority, task.category_id, task.due_date]
      );
      return result.lastInsertRowId;
    },

    async update(
      id: number,
      userId: number,
      task: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'category_id' | 'due_date'>>
    ): Promise<void> {
      const fields: string[] = [];
      const params: (string | number | null)[] = [];

      for (const [key, value] of Object.entries(task)) {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          params.push(value);
        }
      }

      if (fields.length === 0) return;

      fields.push("updated_at = datetime('now')");
      params.push(id, userId);

      await db.runAsync(
        `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
        params
      );
    },

    async toggleStatus(id: number, userId: number): Promise<void> {
      await db.runAsync(
        `UPDATE tasks SET
          status = CASE WHEN status = 'pending' THEN 'completed' ELSE 'pending' END,
          updated_at = datetime('now')
         WHERE id = ? AND user_id = ?`,
        [id, userId]
      );
    },

    async delete(id: number, userId: number): Promise<void> {
      await db.runAsync(
        'DELETE FROM tasks WHERE id = ? AND user_id = ?',
        [id, userId]
      );
    },
  };
}
