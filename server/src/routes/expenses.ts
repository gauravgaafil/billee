import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);

const expenseCategories = [
  'OFFICE',
  'TRAVEL',
  'MEALS',
  'SOFTWARE',
  'MARKETING',
  'UTILITIES',
  'RENT',
  'INSURANCE',
  'SUPPLIES',
  'OTHER',
] as const;

const createExpenseSchema = z.object({
  category: z.enum(expenseCategories),
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().or(z.date()),
  vendor: z.string().optional(),
  notes: z.string().optional(),
  taxDeductible: z.boolean().default(false),
});

const updateExpenseSchema = z.object({
  category: z.enum(expenseCategories).optional(),
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  date: z.string().or(z.date()).optional(),
  vendor: z.string().optional(),
  notes: z.string().optional(),
  taxDeductible: z.boolean().optional(),
});

// GET / - list all expenses for current user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, startDate, endDate } = req.query;

    const where: any = { userId: req.userId };
    if (category) where.category = category as string;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST / - create expense
router.post('/', validate(createExpenseSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { category, description, amount, date, vendor, notes, taxDeductible } = req.body;

    const expense = await prisma.expense.create({
      data: {
        userId: req.userId!,
        category,
        description,
        amount,
        date: new Date(date),
        vendor,
        notes,
        taxDeductible: taxDeductible ?? false,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// GET /:id - get single expense
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// PUT /:id - update expense
router.put('/:id', validate(updateExpenseSchema), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    const { category, description, amount, date, vendor, notes, taxDeductible } = req.body;

    const updateData: any = {};
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = amount;
    if (date !== undefined) updateData.date = new Date(date);
    if (vendor !== undefined) updateData.vendor = vendor;
    if (notes !== undefined) updateData.notes = notes;
    if (taxDeductible !== undefined) updateData.taxDeductible = taxDeductible;

    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE /:id - delete expense
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    await prisma.expense.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;
