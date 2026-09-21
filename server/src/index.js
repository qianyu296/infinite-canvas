import express from "express";
import cors from "cors";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { getDb } from "./database.js";
import { authenticateToken } from "./middleware.js";
import { setupRoutes } from "./routes/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

setupRoutes(app);

app.use("*", authenticateToken, (req, res) => {
    res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

const db = getDb();
console.log("Database connected");

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
});
