import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile header with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="px-6 pb-8 pt-4 lg:pt-0 mt-14 lg:mt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
