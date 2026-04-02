import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: { name: string };
  total: number;
  status: string;
  dueDate: string;
}

interface RecentInvoicesProps {
  invoices: Invoice[];
}

const statusVariant: Record<string, 'success' | 'info' | 'danger' | 'default'> = {
  PAID: 'success',
  SENT: 'info',
  OVERDUE: 'danger',
  DRAFT: 'default',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const RecentInvoices: React.FC<RecentInvoicesProps> = ({ invoices }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h3>
      {invoices.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No invoices yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm">
                    <Link to={`/invoices/${inv.id}`} className="text-primary-600 hover:text-primary-800 font-medium">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{inv.client.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{formatCurrency(inv.total)}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={statusVariant[inv.status] || 'default'}>{inv.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(inv.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentInvoices;
