import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReceiptText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ReceiptText className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Billee</span>
          </div>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            placeholder="Enter your password"
            required
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
