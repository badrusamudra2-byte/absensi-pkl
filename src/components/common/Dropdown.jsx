import { useEffect, useRef } from 'react';
import { cn } from '../../utils/helpers';
import { useClickOutside } from '../../hooks/useApi';

const Dropdown = ({ isOpen, onClose, items, align = 'right' }) => {
  const dropdownRef = useRef(null);
  
  useClickOutside(dropdownRef, onClose);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'fixed z-50 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5',
        'animate-fade-in',
        align === 'right' ? 'right-0' : 'left-0'
      )}
      role="menu"
      aria-orientation="vertical"
    >
      <div className="py-1">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
            className={cn(
              'w-full px-4 py-2.5 text-sm flex items-center gap-3',
              'hover:bg-gray-100 transition-colors',
              item.active && 'bg-blue-50 text-blue-700',
              item.danger && 'text-red-600 hover:bg-red-50'
            )}
            role="menuitem"
          >
            {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
            <span>{item.label}</span>
            {item.active && <span className="ml-auto text-blue-600">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dropdown;