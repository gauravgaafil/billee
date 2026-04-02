import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReceiptText, Building2, Briefcase, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const userTypes = [
  {
    value: 'BUSINESS',
    label: 'Business',
    icon: Building2,
    description: 'Manage invoices and expenses for your business',
  },
  {
    value: 'FREELANCER',
    label: 'Freelancer',
    icon: Briefcase,
    description: 'Track projects, time, and client billing',
  },
  {
    value: 'INFLUENCER',
    label: 'Influencer',
    icon: Megaphone,
    description: 'Handle campaigns, sponsorships, and brand deals',
  },
];

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('BUSINESS');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, userType });
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ReceiptText className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Billee</span>
          </div>
          <p className="text-gray-500 text-sm">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            required
          />

          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a...
            </label>
            <div className="grid grid-cols-3 gap-3">
              {userTypes.map((ut) => {
                const Icon = ut.icon;
                const selected = userType === ut.value;
                return (
                  <button
                    key={ut.value}
                    type="button"
                    onClick={() => setUserType(ut.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors text-center ${
                      selected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{ut.label}</span>
                    <span className="text-xs leading-tight opacity-75">
                      {ut.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
