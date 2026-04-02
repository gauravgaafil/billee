import { NavLink, useNavigate } from 'react-router-dom';
import {
  ReceiptText,
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  BarChart3,
  Briefcase,
  Clock,
  Megaphone,
  Settings as SettingsIcon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-50'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:z-30`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
          <ReceiptText className="h-7 w-7 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">Billee</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <NavLink to="/" end className={linkClass} onClick={onClose}>
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </NavLink>
          <NavLink to="/clients" className={linkClass} onClick={onClose}>
            <Users className="h-5 w-5" />
            Clients
          </NavLink>
          <NavLink to="/invoices" className={linkClass} onClick={onClose}>
            <FileText className="h-5 w-5" />
            Invoices
          </NavLink>
          <NavLink to="/expenses" className={linkClass} onClick={onClose}>
            <Receipt className="h-5 w-5" />
            Expenses
          </NavLink>
          <NavLink to="/reports" className={linkClass} onClick={onClose}>
            <BarChart3 className="h-5 w-5" />
            Reports
          </NavLink>

          <hr className="my-3 border-gray-200" />

          {/* Conditional links based on user type */}
          {user?.userType === 'FREELANCER' && (
            <>
              <NavLink to="/projects" className={linkClass} onClick={onClose}>
                <Briefcase className="h-5 w-5" />
                Projects
              </NavLink>
              <NavLink to="/time-entries" className={linkClass} onClick={onClose}>
                <Clock className="h-5 w-5" />
                Time Tracking
              </NavLink>
            </>
          )}

          {user?.userType === 'INFLUENCER' && (
            <NavLink to="/campaigns" className={linkClass} onClick={onClose}>
              <Megaphone className="h-5 w-5" />
              Campaigns
            </NavLink>
          )}

          <hr className="my-3 border-gray-200" />

          <NavLink to="/settings" className={linkClass} onClick={onClose}>
            <SettingsIcon className="h-5 w-5" />
            Settings
          </NavLink>
        </nav>

        {/* User info + Logout */}
        <div className="border-t border-gray-200 px-4 py-4">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
