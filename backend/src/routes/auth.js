import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import authMiddleware from '../middleware/auth.js';
import { sendOTPEmail } from '../utils/mailer.js';

const router = express.Router();

// Helper to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 1. Signup Route
router.post('/signup', async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Please provide all required fields (name, email, password, role).' });
  }

  try {
    // Check if user already exists
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Start transaction for user creation & wallet creation
    const conn = await db.getPool().getConnection();
    try {
      await conn.beginTransaction();

      // Create user
      const [userResult] = await conn.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email, passwordHash, role]
      );
      const userId = userResult.insertId;

      // Create wallet for the new user
      await conn.query(
        'INSERT INTO wallets (user_id, balance) VALUES (?, 0.00)',
        [userId]
      );

      // Create default subscription (silver) for the user
      const subscriptionExpiry = new Date();
      subscriptionExpiry.setMonth(subscriptionExpiry.getMonth() + 1); // 1 month from now
      await conn.query(
        'INSERT INTO subscriptions (user_id, plan_id, billing_cycle, ends_at) VALUES (?, ?, ?, ?)',
        [userId, 'silver', 'monthly', subscriptionExpiry]
      );

      // Generate OTP
      const otpCode = generateOTP();
      const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      await conn.query(
        'INSERT INTO otp_codes (user_id, code, type, expires_at) VALUES (?, ?, ?, ?)',
        [userId, otpCode, 'signup', expiresAt]
      );

      await conn.commit();

      // Send verification email
      await sendOTPEmail(email, otpCode, 'signup');

      // Return details needed by frontend to verify OTP
      res.status(201).json({
        message: 'Registration successful. OTP sent.',
        user: { id: userId, name, email, role, is_verified: 0 }
      });

    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

  } catch (error) {
    next(error);
  }
});

// 2. Login Route
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  try {
    // Find user
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Check verification status
    if (!user.is_verified) {
      // Send a new OTP on login if not verified
      const otpCode = generateOTP();
      const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      await db.query(
        'INSERT INTO otp_codes (user_id, code, type, expires_at) VALUES (?, ?, ?, ?)',
        [user.id, otpCode, 'signup', expiresAt]
      );

      await sendOTPEmail(user.email, otpCode, 'signup');

      return res.status(403).json({
        error: 'Please verify your email address. OTP has been sent.',
        unverified: true,
        user: { id: user.id, email: user.email }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'escrow_super_secret_key_change_in_production_2025',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        kyc_tier: user.kyc_tier
      }
    });

  } catch (error) {
    next(error);
  }
});

// 3. Verify OTP Route
router.post('/verify-otp', async (req, res, next) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ error: 'Please provide user ID and verification code.' });
  }

  try {
    // Find valid OTP
    const otps = await db.query(
      'SELECT * FROM otp_codes WHERE user_id = ? AND code = ? AND used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [userId, code]
    );

    if (otps.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }

    const otp = otps[0];

    // Transaction to update OTP used status and mark user verified
    const conn = await db.getPool().getConnection();
    try {
      await conn.beginTransaction();

      // Mark OTP as used
      await conn.query('UPDATE otp_codes SET used = 1 WHERE id = ?', [otp.id]);

      // If verifying for signup, mark user verified
      if (otp.type === 'signup') {
        await conn.query('UPDATE users SET is_verified = 1 WHERE id = ?', [userId]);
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    // Get updated user details
    const users = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = users[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'escrow_super_secret_key_change_in_production_2025',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'OTP verified successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        kyc_tier: user.kyc_tier
      }
    });

  } catch (error) {
    next(error);
  }
});

// 4. Resend OTP Route
router.post('/resend-otp', async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Please provide user ID.' });
  }

  try {
    const users = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const email = users[0].email;
    const otpCode = generateOTP();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Invalidate existing active OTPs
    await db.query('UPDATE otp_codes SET used = 1 WHERE user_id = ? AND type = "signup"', [userId]);

    // Create new OTP
    await db.query(
      'INSERT INTO otp_codes (user_id, code, type, expires_at) VALUES (?, ?, ?, ?)',
      [userId, otpCode, 'signup', expiresAt]
    );

    // Send email
    await sendOTPEmail(email, otpCode, 'signup');

    res.json({ message: 'A new verification code has been sent.' });

  } catch (error) {
    next(error);
  }
});

// 5. Forgot Password Route
router.post('/forgot-password', async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Please provide email address.' });
  }

  try {
    const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // Avoid enumerating users, return success message even if not found
      return res.json({ message: 'If the email exists, a reset code has been sent.' });
    }

    const userId = users[0].id;
    const otpCode = generateOTP();
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Invalidate existing active forgot password OTPs
    await db.query('UPDATE otp_codes SET used = 1 WHERE user_id = ? AND type = "forgot"', [userId]);

    // Insert forgot password OTP
    await db.query(
      'INSERT INTO otp_codes (user_id, code, type, expires_at) VALUES (?, ?, ?, ?)',
      [userId, otpCode, 'forgot', expiresAt]
    );

    // Send email
    await sendOTPEmail(email, otpCode, 'forgot');

    res.json({ message: 'If the email exists, a reset code has been sent.' });

  } catch (error) {
    next(error);
  }
});

// 6. Reset Password Route
router.post('/reset-password', async (req, res, next) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Please provide email, code, and new password.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  try {
    const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or reset code.' });
    }

    const userId = users[0].id;

    // Verify forgot password OTP
    const otps = await db.query(
      'SELECT * FROM otp_codes WHERE user_id = ? AND code = ? AND type = "forgot" AND used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [userId, code]
    );

    if (otps.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset code.' });
    }

    const otp = otps[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password and mark OTP as used
    const conn = await db.getPool().getConnection();
    try {
      await conn.beginTransaction();

      await conn.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
      await conn.query('UPDATE otp_codes SET used = 1 WHERE id = ?', [otp.id]);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    res.json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    next(error);
  }
});

// 7. Get Current User Route (Me)
router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

export default router;
