import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Send, CheckCircle, Trash2 } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { invoicesAPI } from '../api/client';
import InvoicePreview from '../components/invoices/InvoicePreview';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoice, loading, refetch } = useFetch<any>(() => invoicesAPI.get(id!), [id]);

  const handleStatusChange = async (status: string) => {
    try {
      await invoicesAPI.updateStatus(id!, status);
      toast.success(`Invoice marked as ${status.toLowerCase()}`);
      refetch();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await invoicesAPI.downloadPDF(id!);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download PDF');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this invoice?')) return;
    try {
      await invoicesAPI.delete(id!);
      toast.success('Invoice deleted');
      navigate('/invoices');
    } catch {
      toast.error('Failed to delete invoice');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return <div className="text-center py-12 text-gray-500">Invoice not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/invoices')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleDownloadPDF}>
            <Download size={16} className="mr-1" /> PDF
          </Button>
          {invoice.status === 'DRAFT' && (
            <Button onClick={() => handleStatusChange('SENT')}>
              <Send size={16} className="mr-1" /> Mark Sent
            </Button>
          )}
          {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
            <Button onClick={() => handleStatusChange('PAID')}>
              <CheckCircle size={16} className="mr-1" /> Mark Paid
            </Button>
          )}
          {invoice.status === 'DRAFT' && (
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 size={16} className="mr-1" /> Delete
            </Button>
          )}
        </div>
      </div>

      <InvoicePreview invoice={invoice} />
    </div>
  );
}
