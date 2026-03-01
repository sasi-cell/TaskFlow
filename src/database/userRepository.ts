import type { SQLiteDatabase } from 'expo-sqlite';
import type { User } from '../types';

export function createUserRepository(db: SQLiteDatabase) {
  return {
    async findByEmail(email: string): Promise<User | null> {
      return db.getFirstAsync<User>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
    },

    async findById(id: number): Promise<Pick<User, 'id' | 'email'> | null> {
      return db.getFirstAsync<Pick<User, 'id' | 'email'>>(
        'SELECT id, email FROM users WHERE id = ?',
        [id]
      );
    },

    async create(email: string, passwordHash: string, salt: string): Promise<number> {
      const result = await db.runAsync(
        'INSERT INTO users (email, password_hash, salt) VALUES (?, ?, ?)',
        [email, passwordHash, salt]
      );
      return result.lastInsertRowId;
    },
  };
}
