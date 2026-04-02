import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

const updateSettingsSchema = z.object({
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

// Apply auth middleware to all routes
router.use(authenticate);

// GET / - get current user settings
router.get('/', async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        businessName: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        country: true,
        logo: true,
        taxId: true,
        currency: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT / - update user settings
router.put('/', validate(updateSettingsSchema), async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: req.body,
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        businessName: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        country: true,
        logo: true,
        taxId: true,
        currency: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
