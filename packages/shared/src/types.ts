export interface User {
  id: number;
  email: string;
  password_hash: string;
  salt: string;
  created_at: string;
}

export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category_id: number | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskWithCategory extends Task {
  category_name: string | null;
  category_color: string | null;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  color: string;
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  category_id?: number;
  search?: string;
  sort_by?: 'due_date' | 'created_at' | 'priority';
  sort_order?: 'asc' | 'desc';
}

export interface AuthState {
  user: Pick<User, 'id' | 'email'> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
