import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: {
    monthly: Array<{ month: string; revenue: number }>;
    total: number;
  } | null;
}

export default function RevenueReport({ data }: Props) {
  if (!data) return null;

  const avg = data.monthly.length > 0 ? data.total / data.monthly.length : 0;
  const highest = data.monthly.reduce((max, m) => (m.revenue > max.revenue ? m : max), { month: '-', revenue: 0 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">${data.total.toFixed(2)}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Monthly Average</p>
          <p className="text-2xl font-bold text-blue-600">${avg.toFixed(2)}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Best Month</p>
          <p className="text-2xl font-bold text-primary-600">{highest.month}</p>
          <p className="text-sm text-gray-500">${highest.revenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="font-medium text-gray-700 mb-4">Monthly Revenue</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
