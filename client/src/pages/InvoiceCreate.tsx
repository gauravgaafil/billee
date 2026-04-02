import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { clientsAPI, invoicesAPI } from '../api/client';
import InvoiceForm from '../components/invoices/InvoiceForm';
import toast from 'react-hot-toast';

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const { data: clients } = useFetch<any[]>(() => clientsAPI.list());

  const handleSubmit = async (data: any) => {
    try {
      const res = await invoicesAPI.create(data);
      toast.success('Invoice created successfully');
      navigate(`/invoices/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/invoices')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
      </div>

      <div className="card">
        <InvoiceForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/invoices')}
          clients={clients || []}
        />
      </div>
    </div>
  );
}
