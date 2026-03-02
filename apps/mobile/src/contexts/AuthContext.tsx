import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import type { AuthState, User } from '@taskflow/shared';
import { createUserRepository } from '../database/userRepository';
import { generateSalt, hashPassword, verifyPassword } from '../utils/password';

const SESSION_KEY = 'taskflow_user_id';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const userRepo = createUserRepository(db);
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const stored = await SecureStore.getItemAsync(SESSION_KEY);
      if (stored) {
        const userId = parseInt(stored, 10);
        const user = await userRepo.findById(userId);
        if (user) {
          setState({ user, isAuthenticated: true, isLoading: false });
          return;
        }
      }
    } catch {}
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }

  const login = useCallback(async (email: string, password: string) => {
    const user = await userRepo.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const valid = await verifyPassword(password, user.salt, user.password_hash);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    await SecureStore.setItemAsync(SESSION_KEY, String(user.id));
    setState({
      user: { id: user.id, email: user.email },
      isAuthenticated: true,
      isLoading: false,
    });
  }, [db]);

  const register = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await userRepo.findByEmail(normalizedEmail);
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const userId = await userRepo.create(normalizedEmail, passwordHash, salt);

    await SecureStore.setItemAsync(SESSION_KEY, String(userId));
    setState({
      user: { id: userId, email: normalizedEmail },
      isAuthenticated: true,
      isLoading: false,
    });
  }, [db]);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
