import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

const updateClientSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

// Apply auth middleware to all routes
router.use(authenticate);

// GET / - list all clients for current user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// POST / - create client
router.post('/', validate(createClientSchema), async (req: AuthRequest, res) => {
  try {
    const client = await prisma.client.create({
      data: {
        ...req.body,
        userId: req.userId!,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// GET /:id - get single client
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
    });

    if (!client || client.userId !== req.userId) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// PUT /:id - update client
router.put('/:id', validate(updateClientSchema), async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.client.findUnique({
      where: { id: req.params.id },
    });

    if (!existing || existing.userId !== req.userId) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /:id - delete client
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.client.findUnique({
      where: { id: req.params.id },
    });

    if (!existing || existing.userId !== req.userId) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    await prisma.client.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;
