import type { User, Task, TaskWithCategory, TaskFilter, Category } from './types';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<Pick<User, 'id' | 'email'> | null>;
  create(email: string, passwordHash: string, salt: string): Promise<number>;
}

export interface ITaskRepository {
  getAll(userId: number, filter?: TaskFilter): Promise<TaskWithCategory[]>;
  getById(id: number, userId: number): Promise<TaskWithCategory | null>;
  create(
    userId: number,
    task: Pick<Task, 'title' | 'description' | 'priority' | 'category_id' | 'due_date'>
  ): Promise<number>;
  update(
    id: number,
    userId: number,
    task: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'category_id' | 'due_date'>>
  ): Promise<void>;
  toggleStatus(id: number, userId: number): Promise<void>;
  delete(id: number, userId: number): Promise<void>;
}

export interface ICategoryRepository {
  getAll(userId: number): Promise<Category[]>;
  getById(id: number, userId: number): Promise<Category | null>;
  create(userId: number, name: string, color: string): Promise<number>;
  update(id: number, userId: number, name: string, color: string): Promise<void>;
  delete(id: number, userId: number): Promise<void>;
}
