import PDFDocument from 'pdfkit';

export async function generateInvoicePDF(invoice: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - 100; // 50px margin each side

    // Header
    doc
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('INVOICE', 50, 50);

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`#${invoice.invoiceNumber || ''}`, 50, 85);

    // From section
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('From', 50, 130);

    doc
      .fontSize(10)
      .font('Helvetica');

    let fromY = 145;
    if (invoice.user?.businessName) {
      doc.text(invoice.user.businessName, 50, fromY);
      fromY += 15;
    }
    if (invoice.user?.name) {
      doc.text(invoice.user.name, 50, fromY);
      fromY += 15;
    }
    if (invoice.user?.address) {
      doc.text(invoice.user.address, 50, fromY);
      fromY += 15;
    }
    if (invoice.user?.email) {
      doc.text(invoice.user.email, 50, fromY);
      fromY += 15;
    }

    // Bill To section
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Bill To', 300, 130);

    doc
      .fontSize(10)
      .font('Helvetica');

    let toY = 145;
    if (invoice.client?.name) {
      doc.text(invoice.client.name, 300, toY);
      toY += 15;
    }
    if (invoice.client?.company) {
      doc.text(invoice.client.company, 300, toY);
      toY += 15;
    }
    if (invoice.client?.address) {
      doc.text(invoice.client.address, 300, toY);
      toY += 15;
    }
    if (invoice.client?.email) {
      doc.text(invoice.client.email, 300, toY);
      toY += 15;
    }

    // Invoice details
    const detailsY = Math.max(fromY, toY) + 20;

    doc
      .fontSize(10)
      .font('Helvetica');

    const issueDate = invoice.issueDate
      ? new Date(invoice.issueDate).toLocaleDateString()
      : 'N/A';
    const dueDate = invoice.dueDate
      ? new Date(invoice.dueDate).toLocaleDateString()
      : 'N/A';

    doc.text(`Issue Date: ${issueDate}`, 50, detailsY);
    doc.text(`Due Date: ${dueDate}`, 50, detailsY + 15);
    doc.text(`Status: ${invoice.status || 'DRAFT'}`, 50, detailsY + 30);
    if (invoice.currency) {
      doc.text(`Currency: ${invoice.currency}`, 50, detailsY + 45);
    }

    // Line items table
    let tableTop = detailsY + 75;

    // Table header
    doc
      .font('Helvetica-Bold')
      .fontSize(10);

    doc.text('Description', 50, tableTop);
    doc.text('Qty', 300, tableTop, { width: 50, align: 'right' });
    doc.text('Unit Price', 360, tableTop, { width: 80, align: 'right' });
    doc.text('Amount', 450, tableTop, { width: 95, align: 'right' });

    // Header line
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(545, tableTop + 15)
      .stroke();

    // Table rows
    doc
      .font('Helvetica')
      .fontSize(10);

    let rowY = tableTop + 25;
    const items = invoice.items || [];

    for (const item of items) {
      if (rowY > 700) {
        doc.addPage();
        rowY = 50;
      }

      const amount = (item.quantity || 0) * (item.unitPrice || 0);

      doc.text(item.description || '', 50, rowY, { width: 240 });
      doc.text(String(item.quantity || 0), 300, rowY, { width: 50, align: 'right' });
      doc.text((item.unitPrice || 0).toFixed(2), 360, rowY, { width: 80, align: 'right' });
      doc.text(amount.toFixed(2), 450, rowY, { width: 95, align: 'right' });

      rowY += 20;
    }

    // Bottom line
    doc
      .moveTo(50, rowY)
      .lineTo(545, rowY)
      .stroke();

    // Totals section
    rowY += 15;

    const subtotal = invoice.subtotal || 0;
    const taxAmount = invoice.taxAmount || 0;
    const discount = invoice.discount || 0;
    const total = invoice.total || 0;

    doc
      .font('Helvetica')
      .fontSize(10);

    doc.text('Subtotal:', 380, rowY, { width: 70, align: 'right' });
    doc.text(subtotal.toFixed(2), 450, rowY, { width: 95, align: 'right' });
    rowY += 18;

    if (invoice.taxRate) {
      doc.text(`Tax (${invoice.taxRate}%):`, 380, rowY, { width: 70, align: 'right' });
      doc.text(taxAmount.toFixed(2), 450, rowY, { width: 95, align: 'right' });
      rowY += 18;
    }

    if (discount > 0) {
      doc.text('Discount:', 380, rowY, { width: 70, align: 'right' });
      doc.text(`-${discount.toFixed(2)}`, 450, rowY, { width: 95, align: 'right' });
      rowY += 18;
    }

    // Total line
    doc
      .moveTo(380, rowY)
      .lineTo(545, rowY)
      .stroke();

    rowY += 8;

    doc
      .font('Helvetica-Bold')
      .fontSize(12);

    doc.text('Total:', 380, rowY, { width: 70, align: 'right' });
    doc.text(total.toFixed(2), 450, rowY, { width: 95, align: 'right' });

    // Notes section
    if (invoice.notes) {
      rowY += 40;

      if (rowY > 700) {
        doc.addPage();
        rowY = 50;
      }

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Notes', 50, rowY);

      doc
        .font('Helvetica')
        .fontSize(9)
        .text(invoice.notes, 50, rowY + 15, { width: pageWidth });
    }

    doc.end();
  });
}
