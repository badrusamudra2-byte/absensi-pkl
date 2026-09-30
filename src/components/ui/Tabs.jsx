import { cn } from '../../utils/helpers';

const Tabs = ({ 
  value, 
  onChange, 
  tabs = [], 
  className = '',
  variant = 'line' 
}) => {
  return (
    <div className={cn('w-full', className)} role="tablist" aria-label="Tab navigation">
      <div className={cn(
        'flex gap-1',
        variant === 'line' && 'border-b border-gray-200',
        variant === 'pills' && 'bg-gray-100 p-1 rounded-lg'
      )}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={value === tab.value}
            aria-controls={`panel-${tab.value}`}
            id={`tab-${tab.value}`}
            onClick={() => !tab.disabled && onChange(tab.value)}
            disabled={tab.disabled}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              tab.disabled 
                ? 'text-gray-400 cursor-not-allowed' 
                : value === tab.value
                  ? variant === 'line' 
                    ? 'text-blue-600 border-b-2 border-blue-600 -mb-px' 
                    : 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            {tab.icon && <tab.icon className="w-4 h-4" aria-hidden="true" />}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;