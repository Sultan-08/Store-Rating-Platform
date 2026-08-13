import { Router } from 'express';
import { query } from '../config/db.js';
import { validateUserForm, validatePassword } from '../../src/utils/validation.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const rows = await query(
      'SELECT id, name, email, address, role, store_id AS storeId, password_hash AS passwordHash FROM users WHERE LOWER(email) = ?',
      [email.trim().toLowerCase()]
    );

    const user = rows[0];
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    delete user.passwordHash;
    return res.json({ token: `token-${user.id}`, user });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Database query failed.' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, address, password } = req.body;

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
      return res.status(409).json({ errors: { email: 'Email is already registered.' } });
    }

    const userId = `user-normal-${Date.now()}`;
    await query(
      'INSERT INTO users (id, name, email, address, role, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, cleanName, cleanEmail, cleanAddress, 'NORMAL', password]
    );

    return res.status(201).json({
      message: 'Registration successful',
      user: { id: userId, name: cleanName, email: cleanEmail, address: cleanAddress, role: 'NORMAL' },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Database insert failed.' });
  }
});

router.post('/update-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const passError = validatePassword(newPassword);
  if (passError) {
    return res.status(400).json({ error: passError });
  }

  try {
    const rows = await query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (rows[0].password_hash !== currentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    await query('UPDATE users SET password_hash = ? WHERE id = ?', [newPassword, userId]);
    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Update password error:', err);
    return res.status(500).json({ error: 'Database update failed.' });
  }
});

export default router;
