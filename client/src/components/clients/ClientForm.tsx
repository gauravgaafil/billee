import React, { useState } from 'react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  notes: string;
}

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ClientFormData>;
}

const emptyForm: ClientFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  notes: '',
};

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [form, setForm] = useState<ClientFormData>({ ...emptyForm, ...initialData });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
      </div>
      <Input label="Company" name="company" value={form.company} onChange={handleChange} />
      <Input label="Address" name="address" value={form.address} onChange={handleChange} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="City" name="city" value={form.city} onChange={handleChange} />
        <Input label="State" name="state" value={form.state} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="ZIP Code" name="zip" value={form.zip} onChange={handleChange} />
        <Input label="Country" name="country" value={form.country} onChange={handleChange} />
      </div>
      <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} rows={3} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Client</Button>
      </div>
    </form>
  );
};

export default ClientForm;
