import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch } from '../hooks/useFetch';
import { clientsAPI } from '../api/client';
import ClientList from '../components/clients/ClientList';
import ClientForm from '../components/clients/ClientForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

export default function Clients() {
  const navigate = useNavigate();
  const { data: clients, loading, error, refetch } = useFetch<any[]>(() => clientsAPI.list());
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!clients) return [];
    const q = search.toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c: any) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const handleSubmit = async (data: any) => {
    try {
      if (editClient) {
        await clientsAPI.update(editClient.id, data);
        toast.success('Client updated successfully');
      } else {
        await clientsAPI.create(data);
        toast.success('Client added successfully');
      }
      setShowModal(false);
      setEditClient(null);
      refetch();
    } catch {
      toast.error(editClient ? 'Failed to update client' : 'Failed to add client');
    }
  };

  const handleDelete = async (client: any) => {
    if (!window.confirm(`Are you sure you want to delete ${client.name}?`)) return;
    setDeleting(client.id);
    try {
      await clientsAPI.delete(client.id);
      toast.success('Client deleted');
      refetch();
    } catch {
      toast.error('Failed to delete client');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (client: any) => {
    setEditClient(client);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditClient(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Button onClick={() => setShowModal(true)}>
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Client
          </span>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      <ClientList
        clients={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRowClick={(client) => navigate(`/clients/${client.id}`)}
      />

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editClient ? 'Edit Client' : 'Add Client'}
        size="lg"
      >
        <ClientForm
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          initialData={editClient ?? undefined}
        />
      </Modal>
    </div>
  );
}
