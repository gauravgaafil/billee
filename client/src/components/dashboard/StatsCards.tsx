import React from 'react';
import { DollarSign, Clock, TrendingDown, Users } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalRevenue: number;
    pendingAmount: number;
    totalExpenses: number;
    totalClients: number;
  };
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const cards = [
  {
    key: 'totalRevenue' as const,
    label: 'Total Revenue',
    icon: DollarSign,
    color: 'bg-green-100 text-green-600',
    format: true,
  },
  {
    key: 'pendingAmount' as const,
    label: 'Pending Amount',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-600',
    format: true,
  },
  {
    key: 'totalExpenses' as const,
    label: 'Total Expenses',
    icon: TrendingDown,
    color: 'bg-red-100 text-red-600',
    format: true,
  },
  {
    key: 'totalClients' as const,
    label: 'Total Clients',
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
    format: false,
  },
];

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map(({ key, label, icon: Icon, color, format }) => (
        <div key={key} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {format ? formatCurrency(stats[key]) : stats[key]}
              </p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
