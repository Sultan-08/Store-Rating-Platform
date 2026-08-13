import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

router.get('/stores', async (req, res) => {
  const { search, userId } = req.query;

  try {
    let sql = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id AS ownerId, s.created_at AS createdAt,
             COALESCE(AVG(r.rating), 0) AS averageRating,
             COUNT(r.id) AS ratingCount
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
    `;

    const params = [];
    if (search && search.trim()) {
      sql += ' WHERE LOWER(s.name) LIKE ? OR LOWER(s.address) LIKE ?';
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term);
    }

    sql += ' GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at';

    const stores = await query(sql, params);

    let userRatingsMap = {};
    if (userId) {
      const myRatings = await query('SELECT store_id, rating FROM ratings WHERE user_id = ?', [userId]);
      myRatings.forEach((r) => {
        userRatingsMap[r.store_id] = r.rating;
      });
    }

    const formatted = stores.map((s) => ({
      ...s,
      averageRating: Number(Number(s.averageRating).toFixed(1)),
      ratingCount: Number(s.ratingCount),
      userRating: userRatingsMap[s.id] !== undefined ? Number(userRatingsMap[s.id]) : undefined,
    }));

    return res.json(formatted);
  } catch (err) {
    console.error('Fetch stores error:', err);
    return res.status(500).json({ error: 'Failed to fetch stores.' });
  }
});

router.post('/ratings', async (req, res) => {
  const { storeId, userId, rating } = req.body;

  if (!storeId || !userId || rating === undefined) {
    return res.status(400).json({ error: 'Store ID, User ID, and rating are required.' });
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
  }

  try {
    const user = await query('SELECT role FROM users WHERE id = ?', [userId]);
    if (user.length === 0 || user[0].role !== 'NORMAL') {
      return res.status(403).json({ error: 'Only normal users can submit ratings.' });
    }

    const ratingId = `rating-${Date.now()}`;
    await query(
      `INSERT INTO ratings (id, store_id, user_id, rating, updated_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = NOW()`,
      [ratingId, storeId, userId, numRating]
    );

    const [stats] = await query(
      'SELECT COALESCE(AVG(rating), 0) AS avgRating, COUNT(id) AS cnt FROM ratings WHERE store_id = ?',
      [storeId]
    );

    return res.json({
      message: 'Rating saved successfully',
      averageRating: Number(Number(stats.avgRating).toFixed(1)),
      ratingCount: Number(stats.cnt),
    });
  } catch (err) {
    console.error('Rating submit error:', err);
    return res.status(500).json({ error: 'Failed to submit rating.' });
  }
});

export default router;
