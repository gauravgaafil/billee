import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { invoicesAPI } from '../api/client';
import InvoiceList from '../components/invoices/InvoiceList';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const TABS = ['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'];

export default function Invoices() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const { data: invoices, loading, refetch } = useFetch<any[]>(() => invoicesAPI.list());

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await invoicesAPI.updateStatus(id, status);
      toast.success(`Invoice marked as ${status.toLowerCase()}`);
      refetch();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      await invoicesAPI.delete(id);
      toast.success('Invoice deleted');
      refetch();
    } catch {
      toast.error('Failed to delete invoice');
    }
  };

  const filtered = (invoices || [])
    .filter((inv: any) => activeTab === 'ALL' || inv.status === activeTab)
    .filter((inv: any) =>
      search === '' ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Link to="/invoices/new">
          <Button><Plus size={18} className="mr-1" /> Create Invoice</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <InvoiceList invoices={filtered} onStatusChange={handleStatusChange} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
