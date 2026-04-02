import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET /revenue
router.get('/revenue', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: 'PAID',
        issueDate: { gte: start, lte: end },
      },
      include: { client: { select: { name: true } } },
      orderBy: { issueDate: 'asc' },
    });

    const total = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

    // Group by month
    const byMonth: Record<string, number> = {};
    for (const inv of invoices) {
      const d = inv.issueDate;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = (byMonth[key] || 0) + (inv.total || 0);
    }

    const monthly = Object.entries(byMonth).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    res.json({ invoices, monthly, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate revenue report' });
  }
});

// GET /expenses
router.get('/expenses', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { startDate, endDate, category } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const where: any = {
      userId,
      date: { gte: start, lte: end },
    };

    if (category) {
      where.category = category as string;
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Group by category
    const byCategory: Record<string, number> = {};
    for (const exp of expenses) {
      const key = exp.category || 'Uncategorized';
      byCategory[key] = (byCategory[key] || 0) + (exp.amount || 0);
    }

    const categories = Object.entries(byCategory).map(([category, amount]) => ({
      category,
      amount,
    }));

    res.json({ expenses, categories, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate expense report' });
  }
});

// GET /tax-summary
router.get('/tax-summary', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);

    const [incomeResult, expenseResult] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          userId,
          status: 'PAID',
          issueDate: { gte: yearStart, lt: yearEnd },
        },
        _sum: { total: true },
      }),
      prisma.expense.aggregate({
        where: {
          userId,
          date: { gte: yearStart, lt: yearEnd },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = incomeResult._sum.total || 0;
    const totalDeductibleExpenses = expenseResult._sum.amount || 0;
    const taxableIncome = totalIncome - totalDeductibleExpenses;
    const estimatedTax = Math.max(0, taxableIncome * 0.3);
    const netIncome = taxableIncome - estimatedTax;

    res.json({
      year,
      totalIncome,
      totalDeductibleExpenses,
      taxableIncome,
      estimatedTax,
      netIncome,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate tax summary' });
  }
});

// GET /export/csv
router.get('/export/csv', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { type, startDate, endDate } = req.query;

    if (!type || !startDate || !endDate) {
      res.status(400).json({ error: 'type, startDate, and endDate are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    let csv = '';

    if (type === 'invoices') {
      const invoices = await prisma.invoice.findMany({
        where: {
          userId,
          issueDate: { gte: start, lte: end },
        },
        include: { client: { select: { name: true } } },
        orderBy: { issueDate: 'asc' },
      });

      csv = 'Invoice Number,Client,Issue Date,Due Date,Status,Subtotal,Tax,Discount,Total\n';
      for (const inv of invoices) {
        csv += `${inv.invoiceNumber},${inv.client?.name || ''},${inv.issueDate.toISOString().split('T')[0]},${inv.dueDate.toISOString().split('T')[0]},${inv.status},${inv.subtotal},${inv.taxAmount},${inv.discount},${inv.total}\n`;
      }
    } else if (type === 'expenses') {
      const expenses = await prisma.expense.findMany({
        where: {
          userId,
          date: { gte: start, lte: end },
        },
        orderBy: { date: 'asc' },
      });

      csv = 'Date,Description,Category,Amount\n';
      for (const exp of expenses) {
        csv += `${exp.date.toISOString().split('T')[0]},"${exp.description || ''}",${exp.category || ''},${exp.amount}\n`;
      }
    } else {
      res.status(400).json({ error: 'Invalid type. Use "invoices" or "expenses"' });
      return;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

export default router;
