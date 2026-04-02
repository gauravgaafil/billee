import { useState } from 'react';
import { Briefcase, Plus, Edit, Trash2 } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { projectsAPI, clientsAPI } from '../api/client';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import toast from 'react-hot-toast';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  ACTIVE: 'success',
  COMPLETED: 'info',
  ON_HOLD: 'warning',
  CANCELLED: 'danger',
};

export default function Projects() {
  const { data: projects, loading, refetch } = useFetch<any[]>(() => projectsAPI.list());
  const { data: clients } = useFetch<any[]>(() => clientsAPI.list());
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', clientId: '', description: '', status: 'ACTIVE', budget: '', startDate: '', endDate: '',
  });

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', clientId: '', description: '', status: 'ACTIVE', budget: '', startDate: '', endDate: '' });
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name, clientId: p.clientId || '', description: p.description || '',
      status: p.status, budget: p.budget?.toString() || '',
      startDate: p.startDate?.slice(0, 10) || '', endDate: p.endDate?.slice(0, 10) || '',
    });
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, budget: form.budget ? parseFloat(form.budget) : null, clientId: form.clientId || null };
    try {
      if (editing) {
        await projectsAPI.update(editing.id, data);
        toast.success('Project updated');
      } else {
        await projectsAPI.create(data);
        toast.success('Project created');
      }
      setShowModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      await projectsAPI.delete(id);
      toast.success('Project deleted');
      refetch();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Button onClick={openNew}><Plus size={18} className="mr-1" /> New Project</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (projects || []).length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Briefcase size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg">No projects yet</p>
          <p className="text-sm">Create your first project to start tracking work</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(projects || []).map((p: any) => (
            <div key={p.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                <Badge variant={STATUS_VARIANT[p.status] || 'default'}>{p.status}</Badge>
              </div>
              {p.client && <p className="text-sm text-gray-500 mb-2">{p.client.name}</p>}
              {p.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>}
              {p.budget && <p className="text-sm font-medium text-gray-700 mb-2">Budget: ${p.budget.toFixed(2)}</p>}
              {(p.startDate || p.endDate) && (
                <p className="text-xs text-gray-400">
                  {p.startDate && new Date(p.startDate).toLocaleDateString()}
                  {p.endDate && ` - ${new Date(p.endDate).toLocaleDateString()}`}
                </p>
              )}
              <div className="flex gap-1 mt-3 pt-3 border-t">
                <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Project' : 'New Project'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Project Name" name="name" value={form.name} onChange={handleChange} required />
          <Select
            label="Client (optional)" name="clientId" value={form.clientId} onChange={handleChange}
            options={(clients || []).map((c: any) => ({ value: c.id, label: c.name }))} placeholder="No client"
          />
          <Textarea label="Description" name="description" value={form.description} onChange={handleChange} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status" name="status" value={form.status} onChange={handleChange}
              options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'COMPLETED', label: 'Completed' }, { value: 'ON_HOLD', label: 'On Hold' }, { value: 'CANCELLED', label: 'Cancelled' }]}
            />
            <Input label="Budget" name="budget" type="number" value={form.budget} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
            <Input label="End Date" name="endDate" type="date" value={form.endDate} onChange={handleChange} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
