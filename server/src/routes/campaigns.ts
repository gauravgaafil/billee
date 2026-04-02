import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET / - list campaigns with client info
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId: req.userId },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// POST / - create campaign
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, clientId, platform, deliverables, fee, startDate, endDate, notes } = req.body;

    const campaign = await prisma.campaign.create({
      data: {
        name,
        clientId: clientId || undefined,
        platform,
        deliverables,
        fee,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        notes,
        userId: req.userId!,
      },
      include: { client: true },
    });

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// GET /:id - get campaign details
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { client: true },
    });

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// PUT /:id - update campaign
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const { name, clientId, platform, deliverables, fee, startDate, endDate, notes } = req.body;

    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        name,
        clientId: clientId !== undefined ? clientId || null : undefined,
        platform,
        deliverables,
        fee,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        notes,
      },
      include: { client: true },
    });

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// DELETE /:id - delete campaign
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.campaign.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    await prisma.campaign.delete({ where: { id: req.params.id } });
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

export default router;
