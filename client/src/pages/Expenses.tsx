import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import { expensesAPI } from '../api/client';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'OFFICE', label: 'Office' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'MEALS', label: 'Meals' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'RENT', label: 'Rent' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'SUPPLIES', label: 'Supplies' },
  { value: 'OTHER', label: 'Other' },
];

export default function Expenses() {
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const { data: expenses, loading, refetch } = useFetch<any[]>(() => expensesAPI.list());

  const filtered = (expenses || []).filter(
    (exp: any) => !categoryFilter || exp.category === categoryFilter
  );

  const totalExpenses = filtered.reduce((sum: number, exp: any) => sum + exp.amount, 0);

  const handleSubmit = async (data: any) => {
    try {
      if (editingExpense) {
        await expensesAPI.update(editingExpense.id, data);
        toast.success('Expense updated');
      } else {
        await expensesAPI.create(data);
        toast.success('Expense added');
      }
      setShowModal(false);
      setEditingExpense(null);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save expense');
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await expensesAPI.delete(id);
      toast.success('Expense deleted');
      refetch();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <Button onClick={() => { setEditingExpense(null); setShowModal(true); }}>
          <Plus size={18} className="mr-1" /> Add Expense
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select
          label=""
          name="categoryFilter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={CATEGORIES}
        />
        <div className="card !p-3 text-sm">
          Total: <span className="font-bold text-lg ml-1">${totalExpenses.toFixed(2)}</span>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <ExpenseList expenses={filtered} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingExpense(null); }}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        size="md"
      >
        <ExpenseForm
          onSubmit={handleSubmit}
          onCancel={() => { setShowModal(false); setEditingExpense(null); }}
          initialData={editingExpense}
        />
      </Modal>
    </div>
  );
}
