import { useState } from 'react';
import { Download } from 'lucide-react';
import { reportsAPI } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import RevenueReport from '../components/reports/RevenueReport';
import ExpenseReport from '../components/reports/ExpenseReport';
import TaxSummary from '../components/reports/TaxSummary';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const TABS = ['Revenue', 'Expenses', 'Tax Summary'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Revenue');
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(`${year}-01-01`);
  const [endDate, setEndDate] = useState(`${year}-12-31`);

  const { data: revenueData, loading: revLoading } = useFetch<any>(
    () => reportsAPI.revenue({ startDate, endDate }),
    [startDate, endDate]
  );
  const { data: expenseData, loading: expLoading } = useFetch<any>(
    () => reportsAPI.expenses({ startDate, endDate }),
    [startDate, endDate]
  );
  const { data: taxData, loading: taxLoading } = useFetch<any>(
    () => reportsAPI.taxSummary({ year }),
    [year]
  );

  const handleExport = async (type: string) => {
    try {
      const res = await reportsAPI.exportCSV({ type, startDate, endDate });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-report.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const loading = activeTab === 'Revenue' ? revLoading : activeTab === 'Expenses' ? expLoading : taxLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <Button variant="secondary" onClick={() => handleExport(activeTab === 'Revenue' ? 'invoices' : 'expenses')}>
          <Download size={16} className="mr-1" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab !== 'Tax Summary' ? (
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field w-auto"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field w-auto"
            />
          </div>
        ) : (
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input-field w-auto"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'Revenue' && <RevenueReport data={revenueData} />}
          {activeTab === 'Expenses' && <ExpenseReport data={expenseData} />}
          {activeTab === 'Tax Summary' && <TaxSummary data={taxData} />}
        </>
      )}
    </div>
  );
}
