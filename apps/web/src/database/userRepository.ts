import type { Database } from 'sql.js';
import type { User, IUserRepository } from '@taskflow/shared';
import { saveDatabase } from './init';

export function createUserRepository(db: Database): IUserRepository {
  return {
    async findByEmail(email: string): Promise<User | null> {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      stmt.bind([email]);
      if (stmt.step()) {
        const row = stmt.getAsObject() as unknown as User;
        stmt.free();
        return row;
      }
      stmt.free();
      return null;
    },

    async findById(id: number): Promise<Pick<User, 'id' | 'email'> | null> {
      const stmt = db.prepare('SELECT id, email FROM users WHERE id = ?');
      stmt.bind([id]);
      if (stmt.step()) {
        const row = stmt.getAsObject() as unknown as Pick<User, 'id' | 'email'>;
        stmt.free();
        return row;
      }
      stmt.free();
      return null;
    },

    async create(email: string, passwordHash: string, salt: string): Promise<number> {
      db.run(
        'INSERT INTO users (email, password_hash, salt) VALUES (?, ?, ?)',
        [email, passwordHash, salt]
      );
      const result = db.exec('SELECT last_insert_rowid()');
      saveDatabase(db);
      return result[0].values[0][0] as number;
    },
  };
}
