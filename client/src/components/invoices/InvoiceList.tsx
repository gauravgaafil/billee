import { Link } from 'react-router-dom';
import { Eye, Send, CheckCircle, Trash2, MoreVertical } from 'lucide-react';
import Badge from '../ui/Badge';
import { useState } from 'react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: { name: string };
  total: number;
  status: string;
  issueDate: string;
  dueDate: string;
  currency: string;
}

interface Props {
  invoices: Invoice[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  DRAFT: 'default',
  SENT: 'info',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'warning',
};

export default function InvoiceList({ invoices, onStatusChange, onDelete }: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No invoices yet</p>
        <p className="text-sm mt-1">Create your first invoice to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Invoice #</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Client</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Issue Date</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Due Date</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <Link to={`/invoices/${inv.id}`} className="text-primary-600 font-medium hover:underline">
                  {inv.invoiceNumber}
                </Link>
              </td>
              <td className="py-3 px-4 text-gray-700">{inv.client.name}</td>
              <td className="py-3 px-4 text-right font-medium">${inv.total.toFixed(2)}</td>
              <td className="py-3 px-4">
                <Badge variant={statusVariant[inv.status] || 'default'}>{inv.status}</Badge>
              </td>
              <td className="py-3 px-4 text-gray-600 text-sm">{new Date(inv.issueDate).toLocaleDateString()}</td>
              <td className="py-3 px-4 text-gray-600 text-sm">{new Date(inv.dueDate).toLocaleDateString()}</td>
              <td className="py-3 px-4 text-right relative">
                <button
                  onClick={() => setOpenMenu(openMenu === inv.id ? null : inv.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <MoreVertical size={16} />
                </button>
                {openMenu === inv.id && (
                  <div className="absolute right-4 top-10 bg-white border rounded-lg shadow-lg z-10 py-1 w-40">
                    <Link
                      to={`/invoices/${inv.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full"
                    >
                      <Eye size={14} /> View
                    </Link>
                    {inv.status === 'DRAFT' && (
                      <button
                        onClick={() => { onStatusChange(inv.id, 'SENT'); setOpenMenu(null); }}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left"
                      >
                        <Send size={14} /> Mark as Sent
                      </button>
                    )}
                    {(inv.status === 'SENT' || inv.status === 'OVERDUE') && (
                      <button
                        onClick={() => { onStatusChange(inv.id, 'PAID'); setOpenMenu(null); }}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left"
                      >
                        <CheckCircle size={14} /> Mark as Paid
                      </button>
                    )}
                    {inv.status === 'DRAFT' && (
                      <button
                        onClick={() => { onDelete(inv.id); setOpenMenu(null); }}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
