import { cn } from '../../utils/helpers';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  children,
  onClose,
  dismissible = false,
  className = '' 
}) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const Icon = icons[type] || Info;

  return (
    <div className={cn('relative p-4 rounded-lg border flex gap-3', styles[type], className)} role="alert">
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h4 className="font-medium mb-1">{title}</h4>}
        {message && <p className="text-sm">{message}</p>}
        {children && <div className="mt-2">{children}</div>}
      </div>
      {dismissible && onClose && (
        <button 
          onClick={onClose} 
          className="p-1 rounded hover:bg-black/10 transition-colors flex-shrink-0"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;