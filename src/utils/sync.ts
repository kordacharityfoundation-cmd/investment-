// Central Database Synchronization Manager

const originalSetItem = localStorage.setItem;
const originalRemoveItem = localStorage.removeItem;

let isSyncingFromServer = false;

// Override localStorage.setItem to intercept and sync to the server
localStorage.setItem = function (key: string, value: string) {
  originalSetItem.call(localStorage, key, value);

  // Sync global keys starting with "musk_" but exclude private device session keys
  if (
    key.startsWith("musk_") &&
    key !== "musk_user" &&
    key !== "musk_admin_user" &&
    key !== "musk_last_active" &&
    !isSyncingFromServer
  ) {
    try {
      const parsedValue = JSON.parse(value);
      fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: parsedValue }),
      }).catch((err) => console.error(`Sync failed for ${key}:`, err));
    } catch (e) {
      // If it's not valid JSON, send it as-is
      fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      }).catch((err) => console.error(`Sync failed for ${key}:`, err));
    }
  }
};

// Override localStorage.removeItem
localStorage.removeItem = function (key: string) {
  originalRemoveItem.call(localStorage, key);

  if (
    key.startsWith("musk_") &&
    key !== "musk_user" &&
    key !== "musk_admin_user" &&
    key !== "musk_last_active" &&
    !isSyncingFromServer
  ) {
    fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: null }),
    }).catch((err) => console.error(`Sync failed for removal of ${key}:`, err));
  }
};

// Initialize synchronization and pull latest data from backend on startup
export async function initSync(): Promise<void> {
  try {
    const res = await fetch("/api/db");
    const data = await res.json();

    if (data.success && data.db) {
      isSyncingFromServer = true;
      
      // Write all retrieved keys to localStorage
      for (const [key, val] of Object.entries(data.db)) {
        if (val !== null && val !== undefined) {
          originalSetItem.call(localStorage, key, JSON.stringify(val));
        }
      }
      
      isSyncingFromServer = false;
      console.log("Central database sync completed successfully.");
    }
  } catch (error) {
    console.error("Failed to perform initial database synchronization:", error);
  }
}

// Background polling helper to refresh client data when updated on other browsers/devices
export function startBackgroundSync(intervalMs = 10000) {
  setInterval(async () => {
    try {
      const res = await fetch("/api/db");
      const data = await res.json();

      if (data.success && data.db) {
        isSyncingFromServer = true;
        let changed = false;

        for (const [key, val] of Object.entries(data.db)) {
          if (val !== null && val !== undefined) {
            const currentLocal = localStorage.getItem(key);
            const incomingStr = JSON.stringify(val);
            if (currentLocal !== incomingStr) {
              originalSetItem.call(localStorage, key, incomingStr);
              changed = true;
            }
          }
        }

        isSyncingFromServer = false;

        // If any keys changed, dispatch a custom event to notify React components to re-render
        if (changed) {
          window.dispatchEvent(new CustomEvent("musk_db_updated"));
        }
      }
    } catch (e) {
      console.error("Background sync fetch failed:", e);
    }
  }, intervalMs);
}
