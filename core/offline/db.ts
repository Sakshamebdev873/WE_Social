import * as SQLite from 'expo-sqlite';

/**
 * Local persistence for the offline booking queue. Must survive app kill —
 * an in-memory array would silently lose QUEUED bookings if the app is
 * backgrounded/killed while offline, which defeats the point of "offline
 * first".
 */
export const db = SQLite.openDatabaseSync('wesocial-offline.db');

db.execSync(`
  CREATE TABLE IF NOT EXISTS booking_queue (
    local_id TEXT PRIMARY KEY NOT NULL,
    draft_json TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    remote_id TEXT,
    error_message TEXT,
    simulate_conflict INTEGER NOT NULL DEFAULT 0
  );
`);
