import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

const variantClasses: Record<string, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
};

export default Badge;
