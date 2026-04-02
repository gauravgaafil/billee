import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// GET /stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const [
      paidInvoices,
      pendingInvoices,
      expenses,
      totalClients,
      recentInvoices,
      allPaidInvoices,
      allExpenses,
      invoiceStatusCounts,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: { userId, status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { userId, status: { in: ['SENT', 'OVERDUE'] } },
        _sum: { total: true },
      }),
      prisma.expense.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.client.count({
        where: { userId },
      }),
      prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { client: { select: { name: true } } },
      }),
      prisma.invoice.findMany({
        where: { userId, status: 'PAID' },
        select: { total: true, issueDate: true },
      }),
      prisma.expense.findMany({
        where: { userId },
        select: { amount: true, date: true },
      }),
      prisma.invoice.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true },
      }),
    ]);

    const totalRevenue = paidInvoices._sum.total || 0;
    const pendingAmount = pendingInvoices._sum.total || 0;
    const totalExpenses = expenses._sum.amount || 0;

    // Calculate monthly revenue for last 12 months
    const now = new Date();
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    const monthlyExpensesArr: { month: string; amount: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const monthLabel = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const revenue = allPaidInvoices
        .filter((inv) => {
          const d = inv.issueDate;
          return d >= monthStart && d < monthEnd;
        })
        .reduce((sum, inv) => sum + (inv.total || 0), 0);

      const expenseTotal = allExpenses
        .filter((exp) => exp.date >= monthStart && exp.date < monthEnd)
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);

      monthlyRevenue.push({ month: monthLabel, revenue });
      monthlyExpensesArr.push({ month: monthLabel, amount: expenseTotal });
    }

    const invoicesByStatus = invoiceStatusCounts.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    res.json({
      totalRevenue,
      pendingAmount,
      totalExpenses,
      totalClients,
      recentInvoices,
      monthlyRevenue,
      monthlyExpenses: monthlyExpensesArr,
      invoicesByStatus,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
