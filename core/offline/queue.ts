import { db } from './db';
import type { BookingDraft, QueueItem, QueueItemStatus } from './types';

interface QueueRow {
  local_id: string;
  draft_json: string;
  status: string;
  created_at: string;
  remote_id: string | null;
  error_message: string | null;
  simulate_conflict: number;
}

function rowToQueueItem(row: QueueRow): QueueItem {
  return {
    localId: row.local_id,
    draft: JSON.parse(row.draft_json) as BookingDraft,
    status: row.status as QueueItemStatus,
    createdAt: row.created_at,
    remoteId: row.remote_id,
    errorMessage: row.error_message,
    simulateConflict: row.simulate_conflict === 1,
  };
}

export function enqueueBooking(draft: BookingDraft, options: { simulateConflict?: boolean } = {}): QueueItem {
  const item: QueueItem = {
    localId: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    draft,
    status: 'QUEUED',
    createdAt: new Date().toISOString(),
    remoteId: null,
    errorMessage: null,
    simulateConflict: options.simulateConflict ?? false,
  };

  db.runSync(
    `INSERT INTO booking_queue (local_id, draft_json, status, created_at, remote_id, error_message, simulate_conflict)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [item.localId, JSON.stringify(item.draft), item.status, item.createdAt, item.remoteId, item.errorMessage, item.simulateConflict ? 1 : 0]
  );

  return item;
}

export function listQueue(): QueueItem[] {
  const rows = db.getAllSync<QueueRow>(`SELECT * FROM booking_queue ORDER BY created_at ASC;`);
  return rows.map(rowToQueueItem);
}

export function listPendingQueue(): QueueItem[] {
  return listQueue().filter((item) => item.status === 'QUEUED');
}

export function updateQueueItem(
  localId: string,
  patch: Partial<Pick<QueueItem, 'status' | 'remoteId' | 'errorMessage'>>
): void {
  const current = listQueue().find((item) => item.localId === localId);
  if (!current) return;

  const next: QueueItem = { ...current, ...patch };
  db.runSync(
    `UPDATE booking_queue SET status = ?, remote_id = ?, error_message = ? WHERE local_id = ?;`,
    [next.status, next.remoteId, next.errorMessage, localId]
  );
}
