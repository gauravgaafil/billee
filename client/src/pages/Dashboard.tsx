import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import { dashboardAPI, clientsAPI, expensesAPI } from '../api/client';
import toast from 'react-hot-toast';
import StatsCards from '../components/dashboard/StatsCards';
import RevenueChart from '../components/dashboard/RevenueChart';
import RecentInvoices from '../components/dashboard/RecentInvoices';
import QuickActions from '../components/dashboard/QuickActions';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, loading, error } = useFetch<any>(() => dashboardAPI.getStats());

  const [showClientModal, setShowClientModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [clientForm, setClientForm] = useState({ name: '', email: '', company: '' });
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', category: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientForm({ ...clientForm, [e.target.name]: e.target.value });
  };

  const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) return;
    setSubmitting(true);
    try {
      await clientsAPI.create(clientForm);
      toast.success('Client added successfully');
      setShowClientModal(false);
      setClientForm({ name: '', email: '', company: '' });
    } catch {
      toast.error('Failed to add client');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description.trim() || !expenseForm.amount) return;
    setSubmitting(true);
    try {
      await expensesAPI.create({
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
      });
      toast.success('Expense logged successfully');
      setShowExpenseModal(false);
      setExpenseForm({ description: '', amount: '', category: '' });
    } catch {
      toast.error('Failed to log expense');
    } finally {
      setSubmitting(false);
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      <StatsCards
        stats={{
          totalRevenue: stats?.totalRevenue ?? 0,
          pendingAmount: stats?.pendingAmount ?? 0,
          totalExpenses: stats?.totalExpenses ?? 0,
          totalClients: stats?.totalClients ?? 0,
        }}
      />

      <QuickActions
        onAddClient={() => setShowClientModal(true)}
        onAddExpense={() => setShowExpenseModal(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart
          monthlyRevenue={stats?.monthlyRevenue ?? []}
          monthlyExpenses={stats?.monthlyExpenses ?? []}
        />
        <RecentInvoices invoices={stats?.recentInvoices ?? []} />
      </div>

      {/* Add Client Modal */}
      <Modal isOpen={showClientModal} onClose={() => setShowClientModal(false)} title="Add Client">
        <form onSubmit={handleAddClient} className="space-y-4">
          <Input label="Name" name="name" value={clientForm.name} onChange={handleClientChange} required />
          <Input label="Email" name="email" type="email" value={clientForm.email} onChange={handleClientChange} />
          <Input label="Company" name="company" value={clientForm.company} onChange={handleClientChange} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowClientModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Client'}</Button>
          </div>
        </form>
      </Modal>

      {/* Log Expense Modal */}
      <Modal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Log Expense">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Input label="Description" name="description" value={expenseForm.description} onChange={handleExpenseChange} required />
          <Input label="Amount" name="amount" type="number" value={expenseForm.amount} onChange={handleExpenseChange} required />
          <Input label="Category" name="category" value={expenseForm.category} onChange={handleExpenseChange} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowExpenseModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Log Expense'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
