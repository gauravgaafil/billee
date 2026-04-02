interface Props {
  data: {
    totalIncome: number;
    totalDeductible: number;
    taxableIncome: number;
    estimatedTax: number;
  } | null;
}

export default function TaxSummary({ data }: Props) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-600">${data.totalIncome.toFixed(2)}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-1">Deductible Expenses</p>
          <p className="text-2xl font-bold text-red-600">${data.totalDeductible.toFixed(2)}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-1">Taxable Income</p>
          <p className="text-2xl font-bold text-blue-600">${data.taxableIncome.toFixed(2)}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500 mb-1">Estimated Tax (30%)</p>
          <p className="text-2xl font-bold text-yellow-600">${data.estimatedTax.toFixed(2)}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="font-medium text-gray-700 mb-4">Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Total Income (Paid Invoices)</span>
            <span className="font-medium text-green-600">${data.totalIncome.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Less: Tax Deductible Expenses</span>
            <span className="font-medium text-red-600">-${data.totalDeductible.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Net Taxable Income</span>
            <span className="font-medium">${data.taxableIncome.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-lg font-bold">
            <span>Estimated Tax Liability</span>
            <span className="text-yellow-600">${data.estimatedTax.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          * This is an estimate based on a flat 30% tax rate. Consult a tax professional for accurate calculations.
        </p>
      </div>
    </div>
  );
}
