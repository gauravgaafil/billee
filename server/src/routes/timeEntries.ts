import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET / - list time entries, support ?projectId filter
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const where: any = { userId: req.userId };

    if (req.query.projectId) {
      where.projectId = req.query.projectId as string;
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: { project: true },
      orderBy: { date: 'desc' },
    });

    res.json(timeEntries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch time entries' });
  }
});

// POST / - create time entry
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, description, hours, date, hourlyRate } = req.body;

    const timeEntry = await prisma.timeEntry.create({
      data: {
        projectId,
        description,
        hours,
        date: date ? new Date(date) : new Date(),
        hourlyRate,
        userId: req.userId!,
      },
      include: { project: true },
    });

    res.status(201).json(timeEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create time entry' });
  }
});

// PUT /:id - update time entry
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.timeEntry.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Time entry not found' });
      return;
    }

    const { projectId, description, hours, date, hourlyRate } = req.body;

    const timeEntry = await prisma.timeEntry.update({
      where: { id: req.params.id },
      data: {
        projectId,
        description,
        hours,
        date: date ? new Date(date) : undefined,
        hourlyRate,
      },
      include: { project: true },
    });

    res.json(timeEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update time entry' });
  }
});

// DELETE /:id - delete time entry
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.timeEntry.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Time entry not found' });
      return;
    }

    await prisma.timeEntry.delete({ where: { id: req.params.id } });
    res.json({ message: 'Time entry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete time entry' });
  }
});

export default router;
