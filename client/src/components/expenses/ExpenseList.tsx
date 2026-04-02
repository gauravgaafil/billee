import { Edit, Trash2, CheckCircle } from 'lucide-react';
import Badge from '../ui/Badge';

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  vendor?: string;
  taxDeductible: boolean;
}

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const categoryVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  OFFICE: 'info',
  TRAVEL: 'success',
  MEALS: 'warning',
  SOFTWARE: 'info',
  MARKETING: 'default',
  UTILITIES: 'danger',
  RENT: 'danger',
  INSURANCE: 'warning',
  SUPPLIES: 'default',
  OTHER: 'default',
};

export default function ExpenseList({ expenses, onEdit, onDelete }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No expenses yet</p>
        <p className="text-sm mt-1">Start tracking your expenses</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Description</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Vendor</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Tax Ded.</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-600">{new Date(exp.date).toLocaleDateString()}</td>
              <td className="py-3 px-4">
                <Badge variant={categoryVariant[exp.category] || 'default'}>{exp.category}</Badge>
              </td>
              <td className="py-3 px-4 text-sm text-gray-700">{exp.description}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{exp.vendor || '-'}</td>
              <td className="py-3 px-4 text-right font-medium">${exp.amount.toFixed(2)}</td>
              <td className="py-3 px-4 text-center">
                {exp.taxDeductible && <CheckCircle size={16} className="text-green-500 mx-auto" />}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onEdit(exp)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => onDelete(exp.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
