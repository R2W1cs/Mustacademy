import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/config/db.js', () => ({
  default: { query: vi.fn() },
}));

vi.mock('../../src/lib/io.js', () => ({
  emitToUser: vi.fn(),
}));

import pool from '../../src/config/db.js';
import { emitToUser } from '../../src/lib/io.js';
import { notifyColleaguesOfNewVideo } from '../../src/services/videoNotification.service.js';

describe('videoNotification.service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('notifies colleagues and the uploader', async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ user_id: 2 }, { user_id: 3 }],
        rowCount: 2,
      })
      .mockResolvedValueOnce({
        rows: [{ user_id: 1 }],
        rowCount: 1,
      });

    const count = await notifyColleaguesOfNewVideo({
      uploaderId: 1,
      uploaderName: 'Ada',
      title: 'Recursion',
      videoId: 99,
    });

    expect(count).toBe(3);
    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(emitToUser).toHaveBeenCalledTimes(3);
    expect(emitToUser).toHaveBeenCalledWith(
      1,
      'notification_received',
      expect.objectContaining({
        type: 'NEW_VIDEO',
        message: expect.stringContaining('uploaded successfully'),
        related_id: 99,
      })
    );
  });
});
