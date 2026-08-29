import { Entry, ChatMessage, Roulette } from './types';

export const api = {
  checkPasswordStatus: async (username: string): Promise<boolean> => {
    const res = await fetch(`/api/users/${encodeURIComponent(username)}/has-password`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.hasPassword;
  },

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
  },

  getMessages: async (): Promise<ChatMessage[]> => {
    const res = await fetch('/api/chat');
    if (!res.ok) return [];
    return res.json();
  },
  uploadFile: async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.fileUrl;
  },
  getRoulettes: async (): Promise<Roulette[]> => {
    const res = await fetch('/api/roulettes');
    if (!res.ok) return [];
    return res.json();
  },
  saveRoulette: async (roulette: Omit<Roulette, 'id'> | Roulette): Promise<void> => {
    await fetch('/api/roulettes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roulette)
    });
  },
  deleteRoulette: async (id: string): Promise<void> => {
    await fetch(`/api/roulettes/${id}`, { method: 'DELETE' });
  }
};
