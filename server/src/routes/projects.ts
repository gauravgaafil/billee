import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET / - list projects for user with client info
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST / - create project
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, clientId, description, budget, startDate, endDate } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        clientId: clientId || undefined,
        description,
        budget,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        userId: req.userId!,
      },
      include: { client: true },
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// GET /:id - get project with time entries
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { client: true, timeEntries: true },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// PUT /:id - update project
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const { name, clientId, description, budget, startDate, endDate } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        name,
        clientId: clientId !== undefined ? clientId || null : undefined,
        description,
        budget,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: { client: true },
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /:id - delete project
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
