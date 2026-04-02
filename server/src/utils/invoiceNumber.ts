import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateInvoiceNumber(userId: string): Promise<string> {
  const count = await prisma.invoice.count({ where: { userId } });
  const number = (count + 1).toString().padStart(4, '0');
  return `INV-${number}`;
}
