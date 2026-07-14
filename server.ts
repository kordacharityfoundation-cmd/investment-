import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db_store.json");

// Middleware to parse JSON bodies
app.use(express.json({ limit: "50mb" }));

// Helper to read database
function readDB(): Record<string, any> {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content) || {};
    }
  } catch (error) {
    console.error("Error reading database file, resetting to empty:", error);
  }
  return {};
}

// Helper to write database
function writeDB(data: Record<string, any>) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// Get full database state
app.get("/api/db", (req, res) => {
  const db = readDB();
  res.json({ success: true, db });
});

// Update specific keys in the database
app.post("/api/db", (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== "object") {
    res.status(400).json({ success: false, error: "Invalid updates format. Must be a key-value object." });
    return;
  }

  const db = readDB();
  let changed = false;

  for (const [key, val] of Object.entries(updates)) {
    // Only accept keys that start with "musk_" to avoid arbitrary writes
    if (key.startsWith("musk_")) {
      db[key] = val;
      changed = true;
    }
  }

  if (changed) {
    writeDB(db);
  }

  res.json({ success: true, db });
});

// Boot the server and load Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
