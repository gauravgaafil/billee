import React from 'react';
import { Link } from 'react-router-dom';
import { FilePlus, UserPlus, Receipt, BarChart3 } from 'lucide-react';
import Button from '../ui/Button';

interface QuickActionsProps {
  onAddClient: () => void;
  onAddExpense: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAddClient, onAddExpense }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/invoices/new"
          className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
        >
          <FilePlus className="w-8 h-8 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">Create Invoice</span>
        </Link>

        <button
          onClick={onAddClient}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
        >
          <UserPlus className="w-8 h-8 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">Add Client</span>
        </button>

        <button
          onClick={onAddExpense}
          className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
        >
          <Receipt className="w-8 h-8 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">Log Expense</span>
        </button>

        <Link
          to="/reports"
          className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
        >
          <BarChart3 className="w-8 h-8 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">View Reports</span>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
