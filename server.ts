import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';

const JWT_SECRET = 'home-tasks-secret-key-super-secure';
const DB_FILE = path.join(process.cwd(), 'database.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

interface Entry {
  id: string;
  taskType: 'trash' | 'dishwasher';
  date: string;
  timeValue: string;
  user: 'Артём' | 'Максим';
  isOutOfOrder?: boolean;
  outOfOrderReason?: string;
  createdAt: number;
}

interface ChatMessage {
  id: string;
  user: string;
  text?: string;
  fileUrl?: string;
  fileType?: 'image' | 'video';
  createdAt: number;
}

interface Roulette {
  id: string;
  name: string;
  options: string[];
}

interface Database {
  entries: Entry[];
  passwords?: Record<string, string>;
  messages?: ChatMessage[];
  roulettes?: Roulette[];
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
    const defaultDb: Database = { entries: INITIAL_ENTRIES, passwords: {}, messages: [], roulettes: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
    return defaultDb;
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  if (!db.passwords) db.passwords = {};
  if (!db.messages) db.messages = [];
  if (!db.roulettes) db.roulettes = [];
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
  createBackup();

  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  app.use(express.json());
  app.use(cookieParser());
  app.use('/uploads', express.static(UPLOADS_DIR));

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

  io.use((socket, next) => {
    // In a real app we'd parse cookies here, but for simplicity we'll just allow connections
    // and clients will identify themselves via messages.
    next();
  });

  io.on('connection', (socket) => {
    socket.on('send_message', (msgData: { user: string; text?: string; fileUrl?: string; fileType?: 'image' | 'video' }) => {
      const db = readDB();
      const newMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        user: msgData.user,
        text: msgData.text,
        fileUrl: msgData.fileUrl,
        fileType: msgData.fileType,
        createdAt: Date.now()
      };
      if (!db.messages) db.messages = [];
      db.messages.push(newMsg);
      writeDB(db);
      io.emit('new_message', newMsg);
    });

    socket.on('spin_roulette', (data: { rouletteId: string, options: string[] }) => {
      const idx = Math.floor(Math.random() * data.options.length);
      const result = data.options[idx];
      io.emit('roulette_spun', {
        rouletteId: data.rouletteId,
        result,
        spinDuration: 2000
      });
    });
  });

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
      maxAge: 365 * 24 * 60 * 60 * 1000
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

  app.get('/api/chat', requireAuth, (req, res) => {
    const db = readDB();
    res.json(db.messages || []);
  });

  app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ fileUrl });
  });

  app.get('/api/roulettes', requireAuth, (req, res) => {
    const db = readDB();
    res.json(db.roulettes || []);
  });

  app.post('/api/roulettes', requireAuth, (req, res) => {
    const db = readDB();
    if (!db.roulettes) db.roulettes = [];
    
    if (req.body.id) {
      // update
      const idx = db.roulettes.findIndex(r => r.id === req.body.id);
      if (idx !== -1) {
        db.roulettes[idx] = req.body;
      } else {
        db.roulettes.push(req.body);
      }
    } else {
      // create
      const newRoulette = {
        ...req.body,
        id: Math.random().toString(36).substring(2, 9)
      };
      db.roulettes.push(newRoulette);
    }
    
    writeDB(db);
    res.json({ success: true });
  });

  app.delete('/api/roulettes/:id', requireAuth, (req, res) => {
    const db = readDB();
    if (!db.roulettes) db.roulettes = [];
    db.roulettes = db.roulettes.filter(r => r.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
  });

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

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
