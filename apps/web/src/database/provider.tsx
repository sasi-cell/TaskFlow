import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Database } from 'sql.js';
import { initDatabase } from './init';

const DatabaseContext = createContext<Database | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initDatabase()
      .then(setDb)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div style={{ padding: 32, color: 'red' }}>Database error: {error}</div>;
  }

  if (!db) {
    return <div style={{ padding: 32 }}>Loading database...</div>;
  }

  return (
    <DatabaseContext.Provider value={db}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase(): Database {
  const db = useContext(DatabaseContext);
  if (!db) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return db;
}
