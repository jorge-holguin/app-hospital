/**
 * Offline Database — SQLite persistence for sync_queue.
 *
 * Uses expo-sqlite to store pending HTTP requests when the device is offline.
 * Each row in sync_queue represents a request that failed due to no connectivity.
 */

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'hjatch_offline.db';

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

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
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
  const database = await getDb();
  await database.runAsync(`DELETE FROM sync_queue WHERE id = ?`, id);
}

/**
 * Increment retry count and set back to pending (or failed if max retries exceeded).
 */
export async function incrementRetry(id: number, maxRetries: number = 5): Promise<void> {
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
  const database = await getDb();
  await database.runAsync(`DELETE FROM sync_queue WHERE status = 'failed'`);
}

/**
 * Clear entire queue.
 */
export async function clearQueue(): Promise<void> {
  const database = await getDb();
  await database.runAsync(`DELETE FROM sync_queue`);
}
