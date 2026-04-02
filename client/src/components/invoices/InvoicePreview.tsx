import Badge from '../ui/Badge';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Props {
  invoice: {
    invoiceNumber: string;
    status: string;
    issueDate: string;
    dueDate: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discount: number;
    total: number;
    notes?: string;
    currency: string;
    items: InvoiceItem[];
    client: {
      name: string;
      email?: string;
      company?: string;
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    user?: {
      name: string;
      businessName?: string;
      email: string;
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
  };
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  DRAFT: 'default',
  SENT: 'info',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'warning',
};

export default function InvoicePreview({ invoice }: Props) {
  return (
    <div className="bg-white border rounded-lg shadow-sm p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
          <p className="text-gray-500 mt-1">{invoice.invoiceNumber}</p>
        </div>
        <Badge variant={statusVariant[invoice.status] || 'default'}>{invoice.status}</Badge>
      </div>

      {/* From / To */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">From</h3>
          <p className="font-medium">{invoice.user?.businessName || invoice.user?.name || 'Your Business'}</p>
          {invoice.user?.email && <p className="text-sm text-gray-600">{invoice.user.email}</p>}
          {invoice.user?.address && <p className="text-sm text-gray-600">{invoice.user.address}</p>}
          {(invoice.user?.city || invoice.user?.state) && (
            <p className="text-sm text-gray-600">
              {[invoice.user.city, invoice.user.state, invoice.user.zip].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Bill To</h3>
          <p className="font-medium">{invoice.client.name}</p>
          {invoice.client.company && <p className="text-sm text-gray-600">{invoice.client.company}</p>}
          {invoice.client.email && <p className="text-sm text-gray-600">{invoice.client.email}</p>}
          {invoice.client.address && <p className="text-sm text-gray-600">{invoice.client.address}</p>}
          {(invoice.client.city || invoice.client.state) && (
            <p className="text-sm text-gray-600">
              {[invoice.client.city, invoice.client.state, invoice.client.zip].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="flex gap-8 mb-8 text-sm">
        <div>
          <span className="text-gray-500">Issue Date: </span>
          <span className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</span>
        </div>
        <div>
          <span className="text-gray-500">Due Date: </span>
          <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-2 text-sm font-medium text-gray-600">Description</th>
            <th className="text-center py-2 text-sm font-medium text-gray-600 w-20">Qty</th>
            <th className="text-right py-2 text-sm font-medium text-gray-600 w-28">Rate</th>
            <th className="text-right py-2 text-sm font-medium text-gray-600 w-28">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-3 text-sm">{item.description}</td>
              <td className="py-3 text-sm text-center">{item.quantity}</td>
              <td className="py-3 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
              <td className="py-3 text-sm text-right font-medium">${item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax ({invoice.taxRate}%)</span>
            <span>${invoice.taxAmount.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="text-red-600">-${invoice.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t-2 pt-2">
            <span>Total</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
          <p className="text-sm text-gray-600">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}
