import type { Database } from 'sql.js';
import type { Task, TaskWithCategory, TaskFilter, ITaskRepository } from '@taskflow/shared';
import { saveDatabase } from './init';

export function createTaskRepository(db: Database): ITaskRepository {
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

      const stmt = db.prepare(query);
      stmt.bind(params);
      const results: TaskWithCategory[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject() as unknown as TaskWithCategory);
      }
      stmt.free();
      return results;
    },

    async getById(id: number, userId: number): Promise<TaskWithCategory | null> {
      const stmt = db.prepare(
        `SELECT t.*, c.name as category_name, c.color as category_color
         FROM tasks t
         LEFT JOIN categories c ON t.category_id = c.id
         WHERE t.id = ? AND t.user_id = ?`
      );
      stmt.bind([id, userId]);
      if (stmt.step()) {
        const row = stmt.getAsObject() as unknown as TaskWithCategory;
        stmt.free();
        return row;
      }
      stmt.free();
      return null;
    },

    async create(
      userId: number,
      task: Pick<Task, 'title' | 'description' | 'priority' | 'category_id' | 'due_date'>
    ): Promise<number> {
      db.run(
        `INSERT INTO tasks (user_id, title, description, priority, category_id, due_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, task.title, task.description, task.priority, task.category_id, task.due_date]
      );
      const result = db.exec('SELECT last_insert_rowid()');
      saveDatabase(db);
      return result[0].values[0][0] as number;
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

      db.run(
        `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
        params
      );
      saveDatabase(db);
    },

    async toggleStatus(id: number, userId: number): Promise<void> {
      db.run(
        `UPDATE tasks SET
          status = CASE WHEN status = 'pending' THEN 'completed' ELSE 'pending' END,
          updated_at = datetime('now')
         WHERE id = ? AND user_id = ?`,
        [id, userId]
      );
      saveDatabase(db);
    },

    async delete(id: number, userId: number): Promise<void> {
      db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
      saveDatabase(db);
    },
  };
}
