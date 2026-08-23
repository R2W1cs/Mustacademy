import pool from '../config/db.js';
import { emitToUser } from '../lib/io.js';

export async function notifyColleaguesOfNewVideo({ uploaderId, uploaderName, title, videoId }) {
  const msg = `${uploaderName} established a new knowledge uplink: "${title}"`;

  const inserted = await pool.query(
    `INSERT INTO notifications (user_id, type, message, related_id)
     SELECT id, 'NEW_VIDEO', $2, $3 FROM users WHERE id != $1
     RETURNING user_id`,
    [uploaderId, msg, videoId]
  );

  const payload = {
    type: 'NEW_VIDEO',
    message: msg,
    related_id: videoId,
    created_at: new Date(),
  };

  for (const row of inserted.rows) {
    emitToUser(row.user_id, 'notification_received', payload);
  }

  return inserted.rowCount;
}

export async function notifyVideoOwner({ ownerId, type, message, relatedId }) {
  await pool.query(
    'INSERT INTO notifications (user_id, type, message, related_id) VALUES ($1, $2, $3, $4)',
    [ownerId, type, message, relatedId]
  );
  emitToUser(ownerId, 'notification_received', {
    type,
    message,
    related_id: relatedId,
    created_at: new Date(),
  });
}