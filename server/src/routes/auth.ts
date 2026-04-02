import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/env';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  userType: z.enum(['BUSINESS', 'FREELANCER', 'INFLUENCER']),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  businessName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  logo: z.string().optional(),
  taxId: z.string().optional(),
  currency: z.string().optional(),
});

// POST /register
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { email, password, name, userType } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        userType,
      },
    });

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: '7d',
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
      expiresIn: '7d',
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// GET /profile
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /profile
router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  async (req: AuthRequest, res) => {
    try {
      const user = await prisma.user.update({
        where: { id: req.userId },
        data: req.body,
      });

      const { password: _, ...userWithoutPassword } = user;

      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

export default router;
