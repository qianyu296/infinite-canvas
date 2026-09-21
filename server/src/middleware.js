import jwt from "jsonwebtoken";
import { getDb } from "./database.js";

const JWT_SECRET = process.env.JWT_SECRET || "infinite-canvas-secret-key-change-in-production";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const user = db.prepare("SELECT id, username, display_name FROM users WHERE id = ?").get(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    req.user = decoded;
    req.userData = user;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
