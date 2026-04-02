import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Mail, Phone, Building2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch } from '../hooks/useFetch';
import { clientsAPI, invoicesAPI } from '../api/client';
import ClientForm from '../components/clients/ClientForm';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

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

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, loading, error, refetch } = useFetch<any>(() => clientsAPI.get(id!), [id]);
  const { data: invoices } = useFetch<any[]>(() => invoicesAPI.list({ clientId: id }), [id]);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleUpdate = async (data: any) => {
    try {
      await clientsAPI.update(id!, data);
      toast.success('Client updated successfully');
      setShowEditModal(false);
      refetch();
    } catch {
      toast.error('Failed to update client');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Client not found'}</p>
        <button onClick={() => navigate('/clients')} className="text-primary-600 mt-2 hover:underline">
          Back to Clients
        </button>
      </div>
    );
  }

  const fullAddress = [client.address, client.city, client.state, client.zip, client.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/clients')} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          {client.company && <p className="text-gray-500">{client.company}</p>}
        </div>
        <Button onClick={() => setShowEditModal(true)}>
          <span className="flex items-center gap-2">
            <Edit2 className="w-4 h-4" />
            Edit
          </span>
        </Button>
      </div>

      <Card title="Contact Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {client.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{client.phone}</span>
            </div>
          )}
          {client.company && (
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{client.company}</span>
            </div>
          )}
          {fullAddress && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{fullAddress}</span>
            </div>
          )}
        </div>
        {client.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">{client.notes}</p>
          </div>
        )}
      </Card>

      <Card title="Invoices">
        {!invoices || invoices.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No invoices for this client.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <Link to={`/invoices/${inv.id}`} className="text-primary-600 hover:text-primary-800 font-medium">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
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
      </Card>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Client" size="lg">
        <ClientForm
          onSubmit={handleUpdate}
          onCancel={() => setShowEditModal(false)}
          initialData={client}
        />
      </Modal>
    </div>
  );
}
