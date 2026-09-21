import { randomUUID } from "node:crypto";
import { getDb, hashPassword, verifyPassword } from "../database.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "infinite-canvas-secret-key-change-in-production";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

export function setupAuthRoutes(app) {
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/me", getMe);
}

function register(req, res) {
  try {
    const { username, password, display_name } = req.body;
    if (!username || !password || !display_name) {
      return res.status(400).json({ error: "Username, password, and display_name are required" });
    }
    if (username.length < 3 || username.length > 32) {
      return res.status(400).json({ error: "Username must be 3-32 characters" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
    if (existing) return res.status(409).json({ error: "Username already exists" });

    const id = randomUUID();
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    db.prepare("INSERT INTO users (id, username, password_hash, display_name, created_at) VALUES (?, ?, ?, ?, ?)").run(id, username, passwordHash, display_name, now);

    const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
    res.status(201).json({ token, user: { id, username, display_name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password are required" });

    const db = getDb();
    const user = db.prepare("SELECT id, username, password_hash, display_name FROM users WHERE username = ?").get(username);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
    res.json({ token, user: { id: user.id, username: user.username, display_name: user.display_name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function logout(req, res) {
  res.json({ message: "Logged out successfully" });
}

function getMe(req, res) {
  res.json({ user: req.userData });
}
