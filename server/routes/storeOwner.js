import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

router.get('/dashboard', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const stores = await query('SELECT * FROM stores WHERE owner_id = ?', [userId]);
    if (stores.length === 0) {
      return res.json({
        hasStore: false,
        message: 'No store linked to this account.',
        averageRating: 0,
        ratingCount: 0,
        ratingsList: [],
      });
    }

    const store = stores[0];

    const sql = `
      SELECT r.id AS ratingId, r.rating, r.updated_at AS updatedAt,
             u.name AS userName, u.email AS userEmail, u.address AS userAddress
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = ?
      ORDER BY r.updated_at DESC
    `;

    const ratingsList = await query(sql, [store.id]);

    const total = ratingsList.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = ratingsList.length > 0 ? Number((total / ratingsList.length).toFixed(1)) : 0;

    return res.json({
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      averageRating,
      ratingCount: ratingsList.length,
      ratingsList,
    });
  } catch (err) {
    console.error('Owner dashboard error:', err);
    return res.status(500).json({ error: 'Failed to fetch store owner data.' });
  }
});

export default router;
