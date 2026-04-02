import React from 'react';

interface TextareaProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  required?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
  required = false,
}) => {
  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`input-field ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Textarea;
