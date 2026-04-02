import { useState } from 'react';
import { Megaphone, Plus, Edit, Trash2 } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { campaignsAPI, clientsAPI } from '../api/client';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import toast from 'react-hot-toast';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  PENDING: 'warning',
  ACTIVE: 'success',
  COMPLETED: 'info',
  CANCELLED: 'danger',
};

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: 'bg-pink-100 text-pink-700',
  YOUTUBE: 'bg-red-100 text-red-700',
  TIKTOK: 'bg-gray-800 text-white',
  TWITTER: 'bg-blue-100 text-blue-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

const PLATFORMS = [
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'TWITTER', label: 'Twitter/X' },
  { value: 'OTHER', label: 'Other' },
];

export default function Campaigns() {
  const { data: campaigns, loading, refetch } = useFetch<any[]>(() => campaignsAPI.list());
  const { data: clients } = useFetch<any[]>(() => clientsAPI.list());
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', clientId: '', platform: 'INSTAGRAM', deliverables: '',
    fee: '', status: 'PENDING', startDate: '', endDate: '', notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', clientId: '', platform: 'INSTAGRAM', deliverables: '', fee: '', status: 'PENDING', startDate: '', endDate: '', notes: '' });
    setShowModal(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      name: c.name, clientId: c.clientId || '', platform: c.platform,
      deliverables: c.deliverables || '', fee: c.fee.toString(), status: c.status,
      startDate: c.startDate?.slice(0, 10) || '', endDate: c.endDate?.slice(0, 10) || '', notes: c.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, fee: parseFloat(form.fee), clientId: form.clientId || null };
    try {
      if (editing) {
        await campaignsAPI.update(editing.id, data);
        toast.success('Campaign updated');
      } else {
        await campaignsAPI.create(data);
        toast.success('Campaign created');
      }
      setShowModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try {
      await campaignsAPI.delete(id);
      toast.success('Campaign deleted');
      refetch();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalEarnings = (campaigns || []).reduce((sum: number, c: any) => sum + c.fee, 0);
  const activeCampaigns = (campaigns || []).filter((c: any) => c.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <Button onClick={openNew}><Plus size={18} className="mr-1" /> New Campaign</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">Total Campaigns</p>
          <p className="text-2xl font-bold text-gray-700">{(campaigns || []).length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeCampaigns}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Total Earnings</p>
          <p className="text-2xl font-bold text-primary-600">${totalEarnings.toFixed(2)}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (campaigns || []).length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Megaphone size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg">No campaigns yet</p>
          <p className="text-sm">Create your first campaign to track brand deals</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(campaigns || []).map((c: any) => (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{c.name}</h3>
                <Badge variant={STATUS_VARIANT[c.status] || 'default'}>{c.status}</Badge>
              </div>
              {c.client && <p className="text-sm text-gray-500 mb-2">{c.client.name}</p>}
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${PLATFORM_COLORS[c.platform] || PLATFORM_COLORS.OTHER}`}>
                  {c.platform}
                </span>
                <span className="text-lg font-bold text-gray-900">${c.fee.toFixed(2)}</span>
              </div>
              {c.deliverables && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{c.deliverables}</p>}
              {(c.startDate || c.endDate) && (
                <p className="text-xs text-gray-400">
                  {c.startDate && new Date(c.startDate).toLocaleDateString()}
                  {c.endDate && ` - ${new Date(c.endDate).toLocaleDateString()}`}
                </p>
              )}
              <div className="flex gap-1 mt-3 pt-3 border-t">
                <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Campaign' : 'New Campaign'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Campaign Name" name="name" value={form.name} onChange={handleChange} required />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Brand/Client" name="clientId" value={form.clientId} onChange={handleChange}
              options={(clients || []).map((c: any) => ({ value: c.id, label: c.name }))} placeholder="Select brand"
            />
            <Select label="Platform" name="platform" value={form.platform} onChange={handleChange} options={PLATFORMS} />
          </div>
          <Textarea label="Deliverables" name="deliverables" value={form.deliverables} onChange={handleChange} placeholder="e.g., 2 Instagram posts, 1 story, 1 reel" />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Fee ($)" name="fee" type="number" value={form.fee} onChange={handleChange} required />
            <Select
              label="Status" name="status" value={form.status} onChange={handleChange}
              options={[{ value: 'PENDING', label: 'Pending' }, { value: 'ACTIVE', label: 'Active' }, { value: 'COMPLETED', label: 'Completed' }, { value: 'CANCELLED', label: 'Cancelled' }]}
            />
            <div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
            <Input label="End Date" name="endDate" type="date" value={form.endDate} onChange={handleChange} />
          </div>
          <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
