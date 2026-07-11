import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter if credentials are provided in the future, or default to console logging
let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendOTPEmail(email, code, type = 'signup') {
  const subject = type === 'signup' 
    ? 'Escrow — Verify Your Account' 
    : 'Escrow — Reset Your Password';

  const body = `
    <h1>Escrow Security Code</h1>
    <p>Your 6-digit verification code is: <strong>${code}</strong></p>
    <p>This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
  `;

  // Always log to terminal console so user can copy/paste during development
  console.log('\n======================================');
  console.log(`EMAIL SENT TO: ${email}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`CODE: ${code}`);
  console.log('======================================\n');

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Escrow Platform" <no-reply@escrow.com>',
        to: email,
        subject,
        html: body,
      });
      console.log('Email dispatched successfully via SMTP.');
    } catch (error) {
      console.error('SMTP sending failed, logged to console instead:', error);
    }
  }
}
