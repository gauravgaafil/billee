import { useState, useEffect } from 'react';
import { settingsAPI } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    businessName: '',
    phone: '',
    taxId: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    currency: 'USD',
  });

  useEffect(() => {
    settingsAPI.get().then((res) => {
      setForm({
        businessName: res.data.businessName || '',
        phone: res.data.phone || '',
        taxId: res.data.taxId || '',
        address: res.data.address || '',
        city: res.data.city || '',
        state: res.data.state || '',
        zip: res.data.zip || '',
        country: res.data.country || '',
        currency: res.data.currency || 'USD',
      });
      setLoading(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.update(form);
      updateUser({ businessName: form.businessName, currency: form.currency });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" name="name" value={user?.name || ''} onChange={() => {}} disabled />
            <Input label="Email" name="email" value={user?.email || ''} onChange={() => {}} disabled />
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Business Information</h2>
          <div className="space-y-4">
            <Input label="Business Name" name="businessName" value={form.businessName} onChange={handleChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
              <Input label="Tax ID" name="taxId" value={form.taxId} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Address</h2>
          <div className="space-y-4">
            <Input label="Street Address" name="address" value={form.address} onChange={handleChange} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input label="City" name="city" value={form.city} onChange={handleChange} />
              <Input label="State" name="state" value={form.state} onChange={handleChange} />
              <Input label="ZIP Code" name="zip" value={form.zip} onChange={handleChange} />
              <Input label="Country" name="country" value={form.country} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Preferences</h2>
          <Select label="Currency" name="currency" value={form.currency} onChange={handleChange} options={CURRENCIES} />
        </div>

        <Button type="submit" disabled={saving} fullWidth>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </div>
  );
}
