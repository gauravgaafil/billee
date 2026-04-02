import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
}) => {
  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
        ? 'btn-secondary'
        : 'btn-danger';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantClass} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`.trim()}
    >
      {children}
    </button>
  );
};

export default Button;
