import React, { useState, useRef, useEffect } from 'react';

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = 'left' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={`absolute z-40 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
            >
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
