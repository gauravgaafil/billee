import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';

interface RevenueChartProps {
  monthlyRevenue: { month: string; revenue: number }[];
  monthlyExpenses: { month: string; amount: number }[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

const RevenueChart: React.FC<RevenueChartProps> = ({ monthlyRevenue, monthlyExpenses }) => {
  const chartData = useMemo(() => {
    const map = new Map<string, { month: string; revenue: number; expenses: number }>();
    monthlyRevenue.forEach(({ month, revenue }) => {
      map.set(month, { month, revenue, expenses: 0 });
    });
    monthlyExpenses.forEach(({ month, amount }) => {
      const existing = map.get(month);
      if (existing) {
        existing.expenses = amount;
      } else {
        map.set(month, { month, revenue: 0, expenses: amount });
      }
    });
    return Array.from(map.values());
  }, [monthlyRevenue, monthlyExpenses]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Expenses</h3>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tickFormatter={(v) => `$${v / 1000}k`} tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
