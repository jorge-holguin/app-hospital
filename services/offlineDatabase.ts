/**
 * Offline Database — SQLite persistence for sync_queue.
 *
 * Uses expo-sqlite to store pending HTTP requests when the device is offline.
 * Each row in sync_queue represents a request that failed due to no connectivity.
 * 
 * Note: On web, uses in-memory storage instead of SQLite to avoid WASM module issues.
 */

import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const DB_NAME = 'hjatch_offline.db';
const IS_WEB = Platform.OS === 'web';

export interface SyncQueueItem {
  id: number;
  method: string;
  url: string;
  headers: string;   // JSON string
  body: string | null; // JSON string or null
  created_at: string;
  retries: number;
  status: 'pending' | 'in_progress' | 'failed';
}

// In-memory storage for web platform
let webStorage: SyncQueueItem[] = [];
let webIdCounter = 1;

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (IS_WEB) {
    throw new Error('SQLite not available on web platform');
  }
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        method TEXT NOT NULL,
        url TEXT NOT NULL,
        headers TEXT NOT NULL DEFAULT '{}',
        body TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        retries INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending'
      );
    `);
  }
  return db;
}

/**
 * Add a request to the sync queue.
 */
export async function enqueueRequest(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: any | null,
): Promise<void> {
  if (IS_WEB) {
    webStorage.push({
      id: webIdCounter++,
      method,
      url,
      headers: JSON.stringify(headers),
      body: body ? JSON.stringify(body) : null,
      created_at: new Date().toISOString(),
      retries: 0,
      status: 'pending',
    });
    console.log('[OfflineDB] Request enqueued (web):', method, url);
    return;
  }
  
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO sync_queue (method, url, headers, body) VALUES (?, ?, ?, ?)`,
    method,
    url,
    JSON.stringify(headers),
    body ? JSON.stringify(body) : null,
  );
  console.log('[OfflineDB] Request enqueued:', method, url);
}

/**
 * Get all pending requests ordered by creation time.
 */
export async function getPendingRequests(): Promise<SyncQueueItem[]> {
  if (IS_WEB) {
    return webStorage
      .filter(item => item.status === 'pending')
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  }
  
  const database = await getDb();
  const rows = await database.getAllAsync<SyncQueueItem>(
    `SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC`,
  );
  return rows;
}

/**
 * Mark a request as in_progress.
 */
export async function markInProgress(id: number): Promise<void> {
  if (IS_WEB) {
    const item = webStorage.find(i => i.id === id);
    if (item) item.status = 'in_progress';
    return;
  }
  
  const database = await getDb();
  await database.runAsync(
    `UPDATE sync_queue SET status = 'in_progress' WHERE id = ?`,
    id,
  );
}

/**
 * Remove a successfully synced request.
 */
export async function removeRequest(id: number): Promise<void> {
  if (IS_WEB) {
    webStorage = webStorage.filter(item => item.id !== id);
    return;
  }
  
  const database = await getDb();
  await database.runAsync(`DELETE FROM sync_queue WHERE id = ?`, id);
}

/**
 * Increment retry count and set back to pending (or failed if max retries exceeded).
 */
export async function incrementRetry(id: number, maxRetries: number = 5): Promise<void> {
  if (IS_WEB) {
    const item = webStorage.find(i => i.id === id);
    if (item) {
      item.retries++;
      item.status = item.retries >= maxRetries ? 'failed' : 'pending';
    }
    return;
  }
  
  const database = await getDb();
  await database.runAsync(
    `UPDATE sync_queue
     SET retries = retries + 1,
         status = CASE WHEN retries + 1 >= ? THEN 'failed' ELSE 'pending' END
     WHERE id = ?`,
    maxRetries,
    id,
  );
}

/**
 * Get the count of pending requests.
 */
export async function getPendingCount(): Promise<number> {
  if (IS_WEB) {
    return webStorage.filter(item => item.status === 'pending').length;
  }
  
  const database = await getDb();
  const result = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'`,
  );
  return result?.count ?? 0;
}

/**
 * Clear all failed requests.
 */
export async function clearFailedRequests(): Promise<void> {
  if (IS_WEB) {
    webStorage = webStorage.filter(item => item.status !== 'failed');
    return;
  }
  
  const database = await getDb();
  await database.runAsync(`DELETE FROM sync_queue WHERE status = 'failed'`);
}

/**
 * Clear entire queue.
 */
export async function clearQueue(): Promise<void> {
  if (IS_WEB) {
    webStorage = [];
    webIdCounter = 1;
    return;
  }
  
  const database = await getDb();
  await database.runAsync(`DELETE FROM sync_queue`);
}
