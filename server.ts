import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db_store.json");

// Middleware to parse JSON bodies
app.use(express.json({ limit: "50mb" }));

// Initialize Supabase Client dynamically using the connected database credentials
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    });
    console.log("Supabase Client successfully initialized via server-side environment credentials.");
  } catch (err) {
    console.error("Error attempting to initialize Supabase client:", err);
  }
} else {
  console.warn(
    "WARNING: SUPABASE_URL and SUPABASE_ANON_KEY were not found in the environment variables.\n" +
    "The application is running in local-file mode. Please configure Supabase variables inside Vercel or your local environment to enable real-time cloud persistence."
  );
}

// Fetch database records from Supabase musk_app_store table
async function getDBFromSupabase(): Promise<{ success: boolean; data: Record<string, any> }> {
  if (!supabase) return { success: false, data: {} };
  try {
    const { data, error } = await supabase
      .from("musk_app_store")
      .select("key, value");

    if (error) {
      console.warn("Supabase table 'musk_app_store' query failed. It might not be created yet:", error.message);
      return { success: false, data: {} };
    }

    const db: Record<string, any> = {};
    if (data) {
      for (const row of data) {
        db[row.key] = row.value;
      }
    }
    return { success: true, data: db };
  } catch (err) {
    console.error("Exception during Supabase query fetch:", err);
    return { success: false, data: {} };
  }
}

// Save key-value entry to Supabase musk_app_store table
async function saveKeyToSupabase(key: string, value: any): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("musk_app_store")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) {
      console.error(`Supabase upsert failed for key '${key}':`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Exception writing key '${key}' to Supabase:`, err);
    return false;
  }
}

// Helper to read database asynchronously
async function readDB(): Promise<Record<string, any>> {
  if (supabase) {
    const sbResult = await getDBFromSupabase();
    if (sbResult.success) {
      return sbResult.data;
    }
  }

  // Fallback to local file
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content) || {};
    }
  } catch (error) {
    console.error("Error reading backup database file:", error);
  }
  return {};
}

// Helper to write database updates asynchronously
async function writeDB(updates: Record<string, any>) {
  // 1. Persist locally to provide fallback cache
  try {
    const currentLocal = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE, "utf-8") || "{}") : {};
    const updated = { ...currentLocal, ...updates };
    fs.writeFileSync(DB_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing backup database file:", error);
  }

  // 2. Persist to Supabase if connected
  if (supabase) {
    for (const [key, val] of Object.entries(updates)) {
      if (key.startsWith("musk_")) {
        await saveKeyToSupabase(key, val);
      }
    }
  }
}

// Get full database state
app.post("/api/register-user", async (req, res) => {
  const { email, password, name, phone, address } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: "Missing required registration parameters (email, password, and name are mandatory)." });
    return;
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Validate password length
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters." });
    return;
  }

  if (supabaseUrl && supabaseKey) {
    try {
      const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;
      const adminClient = createClient(supabaseUrl, adminKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });

      // 1. Check if user already exists in profiles
      const { data: existingProfiles, error: checkError } = await adminClient
        .from("profiles")
        .select("email")
        .eq("email", trimmedEmail);

      if (existingProfiles && existingProfiles.length > 0) {
        res.status(400).json({ error: "An account with this email address already exists. Please login instead." });
        return;
      }

      // 2. Create the Auth user with email_confirm: true (which bypasses email verification)
      const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
        email: trimmedEmail,
        password: password,
        email_confirm: true,
        user_metadata: { name, phone }
      });

      if (createError) {
        res.status(400).json({ error: createError.message });
        return;
      }

      const user = userData.user;
      if (!user) {
        res.status(500).json({ error: "Could not create authenticated user node." });
        return;
      }

      // 3. Create the profile record
      const avatarSeed = "SEED_" + Math.floor(Math.random() * 10000);
      let assignedRole = "user";
      if (["kordacharityfoundation@gmail.com", "admin@muskinvestment.com"].includes(trimmedEmail)) {
        assignedRole = "admin";
      }

      const { error: profileError } = await adminClient
        .from("profiles")
        .insert({
          id: user.id,
          name,
          email: trimmedEmail,
          phone: phone || null,
          address: address || null,
          role: assignedRole,
          status: "Active",
          avatar_seed: avatarSeed
        });

      if (profileError) {
        // Clean up created user to allow retries
        await adminClient.auth.admin.deleteUser(user.id);
        res.status(400).json({ error: `Profile creation failed: ${profileError.message}` });
        return;
      }

      // 4. Create the welcome notification
      try {
        await adminClient
          .from("notifications")
          .insert({
            user_id: user.id,
            user_email: trimmedEmail,
            title: "Investor Node Certified",
            message: "Welcome to Musk Investments. Your asset-compounding node is fully synced and operational.",
            type: "general"
          });
      } catch (notifErr: any) {
        console.warn("Failed to create welcome notification on backend:", notifErr.message);
      }

      // 5. Create the activity log
      try {
        await adminClient
          .from("activity_logs")
          .insert({
            user_id: user.id,
            user_email: trimmedEmail,
            action: "Completed investor onboarding and registered successfully.",
            type: "User"
          });
      } catch (actErr: any) {
        console.warn("Failed to log signup activity on backend:", actErr.message);
      }

      res.json({ success: true, userId: user.id, email: trimmedEmail });
      return;

    } catch (err: any) {
      console.error("Exception during registration process:", err);
      res.status(500).json({ error: err.message || "An unexpected registration error occurred." });
      return;
    }
  } else {
    // Local-only/mock database mode fallback
    try {
      const db = await readDB();
      const usersList = db.musk_users_local || [];
      if (usersList.some((u: any) => u.email.toLowerCase() === trimmedEmail)) {
        res.status(400).json({ error: "An account with this email address already exists. Please login instead." });
        return;
      }

      const mockUserId = "mock-uid-" + Date.now();
      const avatarSeed = "SEED_" + Math.floor(Math.random() * 10000);
      let assignedRole = "user";
      if (["kordacharityfoundation@gmail.com", "admin@muskinvestment.com"].includes(trimmedEmail)) {
        assignedRole = "admin";
      }

      const newUser = {
        id: mockUserId,
        name,
        email: trimmedEmail,
        password,
        phone,
        address,
        role: assignedRole,
        status: "Active",
        avatar_seed: avatarSeed
      };

      usersList.push(newUser);
      await writeDB({ musk_users_local: usersList });

      res.json({ success: true, userId: mockUserId, email: trimmedEmail });
      return;
    } catch (err: any) {
      res.status(500).json({ error: err.message || "An unexpected local registration error occurred." });
      return;
    }
  }
});

app.post("/api/login-user", async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = email.trim().toLowerCase();

  try {
    const db = await readDB();
    const usersList = db.musk_users_local || [];
    const matchedUser = usersList.find((u: any) => u.email.toLowerCase() === trimmedEmail && u.password === password);

    if (matchedUser) {
      res.json({
        success: true,
        user: {
          id: matchedUser.id,
          email: matchedUser.email,
          user_metadata: { name: matchedUser.name }
        },
        profile: {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          phone: matchedUser.phone,
          address: matchedUser.address,
          role: matchedUser.role,
          status: matchedUser.status,
          avatar_seed: matchedUser.avatar_seed
        }
      });
    } else {
      res.status(401).json({ error: "Invalid email address or password." });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "An error occurred during local authentication." });
  }
});

// Get full database state
app.get("/api/db", async (req, res) => {
  const db = await readDB();
  res.json({ success: true, db });
});

// Update specific keys in the database
app.post("/api/db", async (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== "object") {
    res.status(400).json({ success: false, error: "Invalid updates format. Must be a key-value object." });
    return;
  }

  await writeDB(updates);
  const db = await readDB();
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

// Only start listening if NOT imported/run under a Vercel serverless function environment
if (!process.env.VERCEL) {
  startServer();
}

export default app;
