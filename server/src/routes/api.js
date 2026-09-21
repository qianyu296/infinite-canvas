import { randomUUID } from "node:crypto";
import { getDb } from "../database.js";
import { authenticateToken } from "../middleware.js";

export function setupProjectRoutes(app) {
  app.get("/api/projects", authenticateToken, listProjects);
  app.post("/api/projects", authenticateToken, createProject);
  app.get("/api/projects/:id", authenticateToken, getProject);
  app.put("/api/projects/:id", authenticateToken, updateProject);
  app.delete("/api/projects/:id", authenticateToken, deleteProject);
}

export function setupAssetRoutes(app) {
  app.get("/api/assets", authenticateToken, listAssets);
  app.post("/api/assets", authenticateToken, createAsset);
  app.get("/api/assets/:id", authenticateToken, getAsset);
  app.put("/api/assets/:id", authenticateToken, updateAsset);
  app.delete("/api/assets/:id", authenticateToken, deleteAsset);
}

function listProjects(req, res) {
  const db = getDb();
  const projects = db.prepare("SELECT id, title, data, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC").all(req.user.id);
  res.json({ projects });
}

function createProject(req, res) {
  const { title, data } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare("INSERT INTO projects (id, user_id, title, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").run(id, req.user.id, title, JSON.stringify(data || {}), now, now);
  res.status(201).json({ project: { id, title, data: data || {}, created_at: now, updated_at: now } });
}

function getProject(req, res) {
  const db = getDb();
  const project = db.prepare("SELECT id, title, data, created_at, updated_at FROM projects WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json({ project });
}

function updateProject(req, res) {
  const { title, data } = req.body;
  const db = getDb();
  const existing = db.prepare("SELECT id, title, data FROM projects WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: "Project not found" });

  const now = new Date().toISOString();
  const newTitle = title || existing.title;
  const newData = data ? JSON.stringify(data) : existing.data;
  db.prepare("UPDATE projects SET title = ?, data = ?, updated_at = ? WHERE id = ?").run(newTitle, newData, now, req.params.id);
  res.json({ project: { id: req.params.id, title: newTitle, data: newData, updated_at: now } });
}

function deleteProject(req, res) {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: "Project not found" });
  db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
  res.json({ message: "Project deleted" });
}

function listAssets(req, res) {
  const db = getDb();
  const assets = db.prepare("SELECT id, kind, title, data, created_at, updated_at FROM assets WHERE user_id = ? ORDER BY updated_at DESC").all(req.user.id);
  res.json({ assets });
}

function createAsset(req, res) {
  const { kind, title, data } = req.body;
  if (!kind || !title) return res.status(400).json({ error: "Kind and title are required" });

  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare("INSERT INTO assets (id, user_id, kind, title, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(id, req.user.id, kind, title, JSON.stringify(data || {}), now, now);
  res.status(201).json({ asset: { id, kind, title, data: data || {}, created_at: now, updated_at: now } });
}

function getAsset(req, res) {
  const db = getDb();
  const asset = db.prepare("SELECT id, kind, title, data, created_at, updated_at FROM assets WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
  if (!asset) return res.status(404).json({ error: "Asset not found" });
  res.json({ asset });
}

function updateAsset(req, res) {
  const { title, data } = req.body;
  const db = getDb();
  const existing = db.prepare("SELECT id, kind, title, data FROM assets WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: "Asset not found" });

  const now = new Date().toISOString();
  const newTitle = title || existing.title;
  const newData = data ? JSON.stringify(data) : existing.data;
  db.prepare("UPDATE assets SET title = ?, data = ?, updated_at = ? WHERE id = ?").run(newTitle, newData, now, req.params.id);
  res.json({ asset: { id: req.params.id, title: newTitle, data: newData, updated_at: now } });
}

function deleteAsset(req, res) {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM assets WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: "Asset not found" });
  db.prepare("DELETE FROM assets WHERE id = ?").run(req.params.id);
  res.json({ message: "Asset deleted" });
}
