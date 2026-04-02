import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import LineItemRow from './LineItemRow';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  clients: Array<{ id: string; name: string }>;
  initialData?: any;
}

export default function InvoiceForm({ onSubmit, onCancel, clients, initialData }: Props) {
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate?.slice(0, 10) || '');
  const [items, setItems] = useState<LineItem[]>(
    initialData?.items || [{ description: '', quantity: 1, unitPrice: 0 }]
  );
  const [taxRate, setTaxRate] = useState(initialData?.taxRate || 0);
  const [discount, setDiscount] = useState(initialData?.discount || 0);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * taxRate / 100;
  const total = subtotal + taxAmount - discount;

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ clientId, dueDate, items, taxRate, discount, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Client"
          name="clientId"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          options={clients.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Select a client"
          required
        />
        <Input
          label="Due Date"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Line Items</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-xs font-medium text-gray-500 uppercase">
            <div className="flex-1">Description</div>
            <div className="w-20 text-center">Qty</div>
            <div className="w-28">Unit Price</div>
            <div className="w-28 text-right">Amount</div>
            <div className="w-10"></div>
          </div>
          {items.map((item, index) => (
            <LineItemRow
              key={index}
              item={item}
              index={index}
              onChange={handleItemChange}
              onRemove={removeItem}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-3 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Tax Rate (%)"
          name="taxRate"
          type="number"
          value={String(taxRate)}
          onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
        />
        <Input
          label="Discount ($)"
          name="discount"
          type="number"
          value={String(discount)}
          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
        />
      </div>

      <Textarea
        label="Notes"
        name="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Payment terms, thank you note, etc."
      />

      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax ({taxRate}%)</span>
          <span className="font-medium">${taxAmount.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium text-red-600">-${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Create Invoice</Button>
      </div>
    </form>
  );
}
