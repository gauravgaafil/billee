import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  data: {
    byCategory: Array<{ category: string; total: number }>;
    total: number;
  } | null;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6b7280'];

export default function ExpenseReport({ data }: Props) {
  if (!data) return null;

  const topCategory = data.byCategory.reduce((max, c) => (c.total > max.total ? c : max), { category: '-', total: 0 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">${data.total.toFixed(2)}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Top Category</p>
          <p className="text-2xl font-bold text-gray-700">{topCategory.category}</p>
          <p className="text-sm text-gray-500">${topCategory.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="font-medium text-gray-700 mb-4">Expenses by Category</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.byCategory}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.byCategory.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="font-medium text-gray-700 mb-3">Category Breakdown</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-sm text-gray-500">Category</th>
              <th className="text-right py-2 text-sm text-gray-500">Amount</th>
              <th className="text-right py-2 text-sm text-gray-500">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {data.byCategory.map((cat, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 text-sm">{cat.category}</td>
                <td className="py-2 text-sm text-right font-medium">${cat.total.toFixed(2)}</td>
                <td className="py-2 text-sm text-right text-gray-500">
                  {data.total > 0 ? ((cat.total / data.total) * 100).toFixed(1) : 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
