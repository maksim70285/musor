import { Entry } from './types';

export const api = {
  login: async (username: string, password: string):Promise<boolean> => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.ok;
  },

  logout: async () => {
    await fetch('/api/logout', { method: 'POST' });
  },

  me: async (): Promise<string | null> => {
    const res = await fetch('/api/me');
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  },

  getEntries: async (): Promise<Entry[]> => {
    const res = await fetch('/api/entries');
    if (!res.ok) return [];
    return res.json();
  },
  
  addEntry: async (entry: Omit<Entry, 'id' | 'createdAt'>): Promise<void> => {
    await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  },

  deleteEntry: async (id: string): Promise<void> => {
    await fetch(`/api/entries/${id}`, {
      method: 'DELETE'
    });
  }
};
