import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';

const CATEGORIES = [
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

interface Props {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function ExpenseForm({ onSubmit, onCancel, initialData }: Props) {
  const [form, setForm] = useState({
    category: initialData?.category || '',
    description: initialData?.description || '',
    amount: initialData?.amount || '',
    date: initialData?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    vendor: initialData?.vendor || '',
    notes: initialData?.notes || '',
    taxDeductible: initialData?.taxDeductible || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Category"
          name="category"
          value={form.category}
          onChange={handleChange}
          options={CATEGORIES}
          placeholder="Select category"
          required
        />
        <Input
          label="Amount"
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          required
        />
      </div>
      <Input
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Date" name="date" type="date" value={form.date} onChange={handleChange} required />
        <Input label="Vendor" name="vendor" value={form.vendor} onChange={handleChange} />
      </div>
      <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} />
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          name="taxDeductible"
          checked={form.taxDeductible}
          onChange={handleChange}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-700">Tax Deductible</span>
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Update' : 'Add'} Expense</Button>
      </div>
    </form>
  );
}
