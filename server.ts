import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const JWT_SECRET = 'home-tasks-secret-key-super-secure';
const DB_FILE = path.join(process.cwd(), 'database.json');

interface Entry {
  id: string;
  taskType: 'trash' | 'dishwasher';
  date: string; // Moscow date
  timeValue: string; // Moscow time
  user: 'Артём' | 'Максим';
  isOutOfOrder?: boolean;
  outOfOrderReason?: string;
  createdAt: number;
}

interface Database {
  entries: Entry[];
  passwords?: Record<string, string>;
}

// Initial state as requested
const INITIAL_ENTRIES: Entry[] = [
  {
    id: 'init-1',
    taskType: 'trash',
    date: '2026-08-28',
    timeValue: 'утром',
    user: 'Артём',
    createdAt: Date.now() - 2000,
  },
  {
    id: 'init-2',
    taskType: 'dishwasher',
    date: '2026-08-28',
    timeValue: 'утром',
    user: 'Артём',
    createdAt: Date.now() - 1000,
  }
];

function readDB(): Database {
  if (!fs.existsSync(DB_FILE)) {
    const defaultDb = { entries: INITIAL_ENTRIES, passwords: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
    return defaultDb;
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  if (!db.passwords) db.passwords = {};
  return db;
}

function writeDB(data: Database) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function createBackup() {
  if (fs.existsSync(DB_FILE)) {
    const backupFile = path.join(process.cwd(), 'database.backup.json');
    try {
      fs.copyFileSync(DB_FILE, backupFile);
      console.log(`[Backup] Database backed up to ${backupFile}`);
    } catch (e) {
      console.error('[Backup Error] Failed to create backup:', e);
    }
  }
}

async function startServer() {
  // Create an automatic backup on server startup
  createBackup();

  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
      (req as any).user = decoded.username;
      next();
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // --- API Routes ---

  app.get('/api/users/:username/has-password', (req, res) => {
    const db = readDB();
    const hasPassword = !!(db.passwords && db.passwords[req.params.username]);
    res.json({ hasPassword });
  });

  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Bad Request' });

    const db = readDB();
    if (!db.passwords) db.passwords = {};

    if (!db.passwords[username]) {
      // First login - set the password
      db.passwords[username] = password;
      writeDB(db);
    } else if (db.passwords[username] !== password) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '365d' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
    });
    res.json({ success: true, username });
  });

  app.post('/api/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
  });

  app.get('/api/me', (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.json({ user: null });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
      res.json({ user: decoded.username });
    } catch {
      res.json({ user: null });
    }
  });

  app.get('/api/entries', requireAuth, (req, res) => {
    const db = readDB();
    res.json(db.entries);
  });

  app.post('/api/entries', requireAuth, (req, res) => {
    const newEntry = {
      ...req.body,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: Date.now()
    };
    const db = readDB();
    db.entries.push(newEntry);
    writeDB(db);
    res.json(newEntry);
  });

  app.delete('/api/entries/:id', requireAuth, (req, res) => {
    const db = readDB();
    const initialLen = db.entries.length;
    db.entries = db.entries.filter(e => e.id !== req.params.id);
    if (db.entries.length < initialLen) {
      writeDB(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
