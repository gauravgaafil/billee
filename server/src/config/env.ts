import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  fromEmail: process.env.FROM_EMAIL || 'noreply@billee.com',
};
