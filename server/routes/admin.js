import { Router } from 'express';
import { query } from '../config/db.js';
import { validateUserForm, validateStoreForm } from '../../src/utils/validation.js';

const router = Router();

const getDashboardStats = async (req, res) => {
  try {
    const [users] = await query('SELECT COUNT(*) AS count FROM users');
    const [stores] = await query('SELECT COUNT(*) AS count FROM stores');
    const [ratings] = await query('SELECT COUNT(*) AS count FROM ratings');

    return res.json({
      totalUsers: users.count,
      totalStores: stores.count,
      totalRatings: ratings.count,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard metrics.' });
  }
};

router.get('/dashboard', getDashboardStats);
router.get('/stats', getDashboardStats);

router.get('/users', async (req, res) => {
  const { name, email, address, role } = req.query;

  try {
    const sql = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.store_id AS storeId,
             s.name AS storeName,
             COALESCE(AVG(r.rating), 0) AS storeRating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id OR s.id = u.store_id
      LEFT JOIN ratings r ON r.store_id = s.id
      GROUP BY u.id, u.name, u.email, u.address, u.role, u.store_id, s.name
    `;

    let users = await query(sql);

    if (name) {
      const term = name.trim().toLowerCase();
      users = users.filter((u) => u.name.toLowerCase().includes(term));
    }
    if (email) {
      const term = email.trim().toLowerCase();
      users = users.filter((u) => u.email.toLowerCase().includes(term));
    }
    if (address) {
      const term = address.trim().toLowerCase();
      users = users.filter((u) => u.address.toLowerCase().includes(term));
    }
    if (role && role !== 'ALL') {
      users = users.filter((u) => u.role === role);
    }

    return res.json(
      users.map((u) => ({
        ...u,
        storeRating: u.storeRating ? Number(Number(u.storeRating).toFixed(1)) : 0,
      }))
    );
  } catch (err) {
    console.error('Users list error:', err);
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

router.post('/users', async (req, res) => {
  const { name, email, address, password, role, storeId } = req.body;

  if (!role || !['ADMIN', 'NORMAL', 'STORE_OWNER'].includes(role)) {
    return res.status(400).json({ errors: { role: 'Invalid role selected.' } });
  }

  const errors = validateUserForm({ name, email, address, password });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanAddress = address.trim();

  try {
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ errors: { email: 'Email already registered.' } });
    }

    const userId = `user-${role.toLowerCase()}-${Date.now()}`;
    const assignedStore = role === 'STORE_OWNER' ? storeId || null : null;

    await query(
      'INSERT INTO users (id, name, email, address, role, store_id, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, cleanName, cleanEmail, cleanAddress, role, assignedStore, password]
    );

    if (role === 'STORE_OWNER' && storeId) {
      await query('UPDATE stores SET owner_id = ? WHERE id = ?', [userId, storeId]);
    }

    return res.status(201).json({
      message: 'User created successfully',
      user: { id: userId, name: cleanName, email: cleanEmail, address: cleanAddress, role },
    });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ error: 'Failed to create user.' });
  }
});

router.get('/stores', async (req, res) => {
  try {
    const sql = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id AS ownerId, s.created_at AS createdAt,
             COALESCE(AVG(r.rating), 0) AS averageRating,
             COUNT(r.id) AS ratingCount
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at
    `;

    const stores = await query(sql);

    return res.json(
      stores.map((s) => ({
        ...s,
        averageRating: Number(Number(s.averageRating).toFixed(1)),
        ratingCount: Number(s.ratingCount),
      }))
    );
  } catch (err) {
    console.error('Get stores error:', err);
    return res.status(500).json({ error: 'Failed to fetch stores.' });
  }
});

router.post('/stores', async (req, res) => {
  const { name, email, address, ownerId } = req.body;

  const errors = validateStoreForm({ name, email, address });
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanAddress = address.trim();
  const storeId = `store-${Date.now()}`;

  try {
    await query(
      'INSERT INTO stores (id, name, email, address, owner_id) VALUES (?, ?, ?, ?, ?)',
      [storeId, cleanName, cleanEmail, cleanAddress, ownerId || null]
    );

    if (ownerId) {
      await query('UPDATE users SET store_id = ? WHERE id = ?', [storeId, ownerId]);
    }

    return res.status(201).json({
      message: 'Store added successfully',
      store: { id: storeId, name: cleanName, email: cleanEmail, address: cleanAddress, ownerId: ownerId || null },
    });
  } catch (err) {
    console.error('Create store error:', err);
    return res.status(500).json({ error: 'Failed to create store.' });
  }
});

export default router;
