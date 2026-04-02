import { Trash2 } from 'lucide-react';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  item: LineItem;
  index: number;
  onChange: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
}

export default function LineItemRow({ item, index, onChange, onRemove }: Props) {
  const amount = item.quantity * item.unitPrice;

  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        placeholder="Description"
        value={item.description}
        onChange={(e) => onChange(index, 'description', e.target.value)}
        className="input-field flex-1"
      />
      <input
        type="number"
        placeholder="Qty"
        value={item.quantity}
        onChange={(e) => onChange(index, 'quantity', parseFloat(e.target.value) || 0)}
        className="input-field w-20 text-center"
        min="0"
        step="1"
      />
      <input
        type="number"
        placeholder="Price"
        value={item.unitPrice}
        onChange={(e) => onChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
        className="input-field w-28"
        min="0"
        step="0.01"
      />
      <div className="w-28 text-right font-medium text-gray-700">
        ${amount.toFixed(2)}
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
