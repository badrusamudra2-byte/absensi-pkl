import { cn } from '../../utils/helpers';

const Card = ({ 
  children, 
  className = '', 
  header, 
  footer, 
  padded = true,
  hover = false 
}) => {
  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 shadow-sm',
      hover && 'hover:shadow-md transition-shadow duration-200 cursor-pointer',
      className
    )}>
      {header && (
        <div className={cn('px-6 py-4 border-b border-gray-200', padded && '')}>
          {header}
        </div>
      )}
      <div className={cn(padded ? 'p-6' : 'p-0')}>
        {children}
      </div>
      {footer && (
        <div className={cn('px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl', padded && '')}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;