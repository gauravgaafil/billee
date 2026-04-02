import { useState } from 'react';
import { Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { timeEntriesAPI, projectsAPI } from '../api/client';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import toast from 'react-hot-toast';

export default function TimeEntries() {
  const { data: entries, loading, refetch } = useFetch<any[]>(() => timeEntriesAPI.list());
  const { data: projects } = useFetch<any[]>(() => projectsAPI.list());
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filterProject, setFilterProject] = useState('');
  const [form, setForm] = useState({
    projectId: '', description: '', hours: '', date: new Date().toISOString().slice(0, 10), hourlyRate: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openNew = () => {
    setEditing(null);
    setForm({ projectId: '', description: '', hours: '', date: new Date().toISOString().slice(0, 10), hourlyRate: '' });
    setShowModal(true);
  };

  const openEdit = (entry: any) => {
    setEditing(entry);
    setForm({
      projectId: entry.projectId, description: entry.description || '',
      hours: entry.hours.toString(), date: entry.date.slice(0, 10),
      hourlyRate: entry.hourlyRate?.toString() || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form, hours: parseFloat(form.hours),
      hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
    };
    try {
      if (editing) {
        await timeEntriesAPI.update(editing.id, data);
        toast.success('Entry updated');
      } else {
        await timeEntriesAPI.create(data);
        toast.success('Time logged');
      }
      setShowModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await timeEntriesAPI.delete(id);
      toast.success('Entry deleted');
      refetch();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = (entries || []).filter((e: any) => !filterProject || e.projectId === filterProject);
  const totalHours = filtered.reduce((sum: number, e: any) => sum + e.hours, 0);
  const totalEarnings = filtered.reduce((sum: number, e: any) => sum + e.hours * (e.hourlyRate || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
        <Button onClick={openNew}><Plus size={18} className="mr-1" /> Log Time</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">Total Hours</p>
          <p className="text-2xl font-bold text-primary-600">{totalHours.toFixed(1)}h</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Total Earnings</p>
          <p className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Entries</p>
          <p className="text-2xl font-bold text-gray-700">{filtered.length}</p>
        </div>
      </div>

      <Select
        label="" name="filterProject" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}
        options={[{ value: '', label: 'All Projects' }, ...(projects || []).map((p: any) => ({ value: p.id, label: p.name }))]}
      />

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No time entries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Hours</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry: any) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm font-medium">{entry.project?.name || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{entry.description || '-'}</td>
                    <td className="py-3 px-4 text-sm text-right">{entry.hours}h</td>
                    <td className="py-3 px-4 text-sm text-right">{entry.hourlyRate ? `$${entry.hourlyRate}/h` : '-'}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium">
                      {entry.hourlyRate ? `$${(entry.hours * entry.hourlyRate).toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(entry)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(entry.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Entry' : 'Log Time'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Project" name="projectId" value={form.projectId} onChange={handleChange}
            options={(projects || []).map((p: any) => ({ value: p.id, label: p.name }))} placeholder="Select project" required
          />
          <Input label="Description" name="description" value={form.description} onChange={handleChange} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Hours" name="hours" type="number" value={form.hours} onChange={handleChange} required />
            <Input label="Date" name="date" type="date" value={form.date} onChange={handleChange} required />
            <Input label="Hourly Rate ($)" name="hourlyRate" type="number" value={form.hourlyRate} onChange={handleChange} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Log Time'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
