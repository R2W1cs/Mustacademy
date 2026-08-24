import pool from '../config/db.js';
import { emitToUser } from '../lib/io.js';

export async function notifyColleaguesOfNewVideo({ uploaderId, uploaderName, title, videoId }) {
  const colleagueMsg = `${uploaderName} established a new knowledge uplink: "${title}"`;
  const uploaderMsg = `Your video was uploaded successfully: "${title}"`;

  const colleagues = await pool.query(
    `INSERT INTO notifications (user_id, type, message, related_id)
     SELECT id, 'NEW_VIDEO', $2, $3 FROM users WHERE id != $1
     RETURNING user_id`,
    [uploaderId, colleagueMsg, videoId]
  );

  const uploaderNotif = await pool.query(
    `INSERT INTO notifications (user_id, type, message, related_id)
     VALUES ($1, 'NEW_VIDEO', $2, $3)
     RETURNING user_id`,
    [uploaderId, uploaderMsg, videoId]
  );

  const colleaguePayload = {
    type: 'NEW_VIDEO',
    message: colleagueMsg,
    related_id: videoId,
    created_at: new Date(),
  };

  for (const row of colleagues.rows) {
    emitToUser(row.user_id, 'notification_received', colleaguePayload);
  }

  const uploaderPayload = {
    type: 'NEW_VIDEO',
    message: uploaderMsg,
    related_id: videoId,
    created_at: new Date(),
  };
  emitToUser(uploaderId, 'notification_received', uploaderPayload);

  return colleagues.rowCount + uploaderNotif.rowCount;
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
