import nodemailer from 'nodemailer';
import { config } from '../config/env';

function createTransporter() {
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
}

export async function sendInvoiceEmail(
  to: string,
  invoice: any,
  pdfBuffer: Buffer
): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(
      `SMTP not configured. Skipping email to ${to} for invoice ${invoice.invoiceNumber || invoice.id}`
    );
    return;
  }

  await transporter.sendMail({
    from: config.fromEmail,
    to,
    subject: `Invoice ${invoice.invoiceNumber || ''} from ${invoice.user?.businessName || invoice.user?.name || 'Billee'}`,
    html: `
      <h2>Invoice ${invoice.invoiceNumber || ''}</h2>
      <p>Please find your invoice attached.</p>
      <p><strong>Amount Due:</strong> $${(invoice.total || 0).toFixed(2)}</p>
      <p><strong>Due Date:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
      <br>
      <p>Thank you for your business!</p>
    `,
    attachments: [
      {
        filename: `invoice-${invoice.invoiceNumber || invoice.id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}
