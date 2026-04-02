import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  title: string;
  action?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, action }) => {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <header className="flex items-center justify-between py-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        {action && <div>{action}</div>}

        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Header;
