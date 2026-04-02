import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { generateInvoiceNumber } from '../utils/invoiceNumber';
import { generateInvoicePDF } from '../services/pdf';

const prisma = new PrismaClient();
const router = Router();

router.use(authenticate);

// Schemas
const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

const createInvoiceSchema = z.object({
  clientId: z.string().min(1),
  dueDate: z.string().or(z.date()),
  items: z.array(invoiceItemSchema).min(1),
  taxRate: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  notes: z.string().optional(),
  currency: z.string().default('USD'),
});

const updateInvoiceSchema = z.object({
  clientId: z.string().min(1).optional(),
  dueDate: z.string().or(z.date()).optional(),
  items: z.array(invoiceItemSchema).min(1).optional(),
  taxRate: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  currency: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
});

// GET / - list all invoices for current user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, clientId } = req.query;

    const where: any = { userId: req.userId };
    if (status) where.status = status as string;
    if (clientId) where.clientId = clientId as string;

    const invoices = await prisma.invoice.findMany({
      where,
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// POST / - create invoice with items
router.post('/', validate(createInvoiceSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, dueDate, items, taxRate, discount, notes, currency } = req.body;

    const invoiceNumber = await generateInvoiceNumber(req.userId!);

    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (taxRate ?? 0) / 100;
    const total = subtotal + taxAmount - (discount ?? 0);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: req.userId!,
        clientId,
        dueDate: new Date(dueDate),
        subtotal,
        taxRate: taxRate ?? 0,
        taxAmount,
        discount: discount ?? 0,
        total,
        notes,
        currency: currency ?? 'USD',
        status: 'DRAFT',
        items: {
          create: items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true, client: true },
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// GET /:id - get single invoice
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { items: true, client: true },
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// PUT /:id - update invoice (only DRAFT)
router.put('/:id', validate(updateInvoiceSchema), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    if (existing.status !== 'DRAFT') {
      res.status(400).json({ error: 'Only DRAFT invoices can be updated' });
      return;
    }

    const { clientId, dueDate, items, taxRate, discount, notes, currency } = req.body;

    const updateData: any = {};
    if (clientId !== undefined) updateData.clientId = clientId;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (taxRate !== undefined) updateData.taxRate = taxRate;
    if (discount !== undefined) updateData.discount = discount;
    if (notes !== undefined) updateData.notes = notes;
    if (currency !== undefined) updateData.currency = currency;

    if (items) {
      // Recalculate totals with new items
      const effectiveTaxRate = taxRate ?? existing.taxRate ?? 0;
      const effectiveDiscount = discount ?? existing.discount ?? 0;

      const subtotal = items.reduce(
        (sum: number, item: { quantity: number; unitPrice: number }) =>
          sum + item.quantity * item.unitPrice,
        0
      );
      const taxAmount = subtotal * effectiveTaxRate / 100;
      const total = subtotal + taxAmount - effectiveDiscount;

      updateData.subtotal = subtotal;
      updateData.taxAmount = taxAmount;
      updateData.total = total;

      // Delete old items and create new ones
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: req.params.id },
      });

      updateData.items = {
        create: items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        })),
      };
    }

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: updateData,
      include: { items: true, client: true },
    });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// DELETE /:id - delete invoice (only DRAFT)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    if (existing.status !== 'DRAFT') {
      res.status(400).json({ error: 'Only DRAFT invoices can be deleted' });
      return;
    }

    await prisma.invoice.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// PUT /:id/status - update invoice status
router.put('/:id/status', validate(updateStatusSchema), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
      include: { items: true, client: true },
    });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
});

// GET /:id/pdf - generate PDF
router.get('/:id/pdf', async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { items: true, client: true },
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const pdfBuffer = await generateInvoicePDF(invoice);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;
