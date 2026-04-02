import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, action, className = '' }) => {
  return (
    <div className={`card ${className}`.trim()}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
