import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// GET /profile - Get current user profile
router.get('/profile', async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
});

// PATCH /profile - Update profile details
router.patch('/profile', async (req, res, next) => {
  const {
    name,
    email,
    phone,
    two_factor_enabled,
    notif_email,
    notif_sms,
    notif_push,
    public_profile,
    marketing_comms
  } = req.body;
  const userId = req.user.id;

  const hasUpdates =
    name !== undefined ||
    email !== undefined ||
    phone !== undefined ||
    two_factor_enabled !== undefined ||
    notif_email !== undefined ||
    notif_sms !== undefined ||
    notif_push !== undefined ||
    public_profile !== undefined ||
    marketing_comms !== undefined;

  if (!hasUpdates) {
    return res.status(400).json({ error: 'Please provide at least one field to update.' });
  }

  try {
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name ? name.trim() : '');
    }

    if (email !== undefined) {
      const emailLower = email.trim().toLowerCase();
      // Check if email already exists for another user
      const existing = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [emailLower, userId]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }
      updates.push('email = ?');
      params.push(emailLower);
    }

    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone ? phone.trim() : null);
    }

    // Toggle fields
    if (two_factor_enabled !== undefined) {
      updates.push('two_factor_enabled = ?');
      params.push(two_factor_enabled ? 1 : 0);
    }

    if (notif_email !== undefined) {
      updates.push('notif_email = ?');
      params.push(notif_email ? 1 : 0);
    }

    if (notif_sms !== undefined) {
      updates.push('notif_sms = ?');
      params.push(notif_sms ? 1 : 0);
    }

    if (notif_push !== undefined) {
      updates.push('notif_push = ?');
      params.push(notif_push ? 1 : 0);
    }

    if (public_profile !== undefined) {
      updates.push('public_profile = ?');
      params.push(public_profile ? 1 : 0);
    }

    if (marketing_comms !== undefined) {
      updates.push('marketing_comms = ?');
      params.push(marketing_comms ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    params.push(userId);

    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Fetch updated user
    const users = await db.query(
      'SELECT id, name, email, role, phone, kyc_tier, is_verified, two_factor_enabled, notif_email, notif_sms, notif_push, public_profile, marketing_comms FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully.',
      user: users[0]
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /change-password - Change user password
router.patch('/change-password', async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Please provide current and new passwords.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  try {
    // Get full user detail including password hash
    const users = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = users[0];

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Save new password
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
});

// PATCH /kyc - Update KYC tier
router.patch('/kyc', async (req, res, next) => {
  const { tier } = req.body;
  const userId = req.user.id;

  if (tier === undefined || isNaN(tier)) {
    return res.status(400).json({ error: 'Invalid KYC tier provided.' });
  }

  try {
    await db.query('UPDATE users SET kyc_tier = ? WHERE id = ?', [tier, userId]);
    res.json({ message: 'KYC status updated successfully.', kyc_tier: tier });
  } catch (error) {
    next(error);
  }
});

// DELETE /profile - Delete user account
router.delete('/profile', async (req, res, next) => {
  const userId = req.user.id;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// GET /sessions - Fetch active sessions
router.get('/sessions', async (req, res, next) => {
  const userId = req.user.id;
  try {
    const sessions = await db.query(
      'SELECT id, device, ip_address, location, token_jti, last_active, created_at FROM user_sessions WHERE user_id = ? ORDER BY last_active DESC',
      [userId]
    );
    const mapped = sessions.map(s => ({
      id: s.id,
      device: s.device,
      ip_address: s.ip_address,
      location: s.location,
      last_active: s.last_active,
      created_at: s.created_at,
      active: s.token_jti === req.sessionJti
    }));
    res.json(mapped);
  } catch (error) {
    next(error);
  }
});

// DELETE /sessions/:id - Revoke user session
router.delete('/sessions/:id', async (req, res, next) => {
  const userId = req.user.id;
  const sessionId = req.params.id;
  try {
    await db.query(
      'DELETE FROM user_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );
    res.json({ message: 'Session revoked successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
