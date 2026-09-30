import { cn } from '../../utils/helpers';

const Table = ({ 
  columns = [], 
  data = [], 
  keyField = 'id',
  className = '',
  striped = true,
  hoverable = true,
  bordered = true,
  emptyMessage = 'Tidak ada data',
  renderRow,
  onRowClick,
  loading = false,
  pagination,
  onPageChange,
  onSort,
  sortBy,
  sortOrder,
}) => {
  const sortedData = data;

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider', col.className)}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-6 py-4 whitespace-nowrap', col.className)}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  col.className,
                  col.sortable && 'cursor-pointer hover:bg-gray-100 select-none'
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
                style={{ userSelect: col.sortable ? 'none' : 'auto' }}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, rowIndex) => {
            const rowKey = row[keyField] || rowIndex;
            const rowProps = onRowClick ? { onClick: () => onRowClick(row) } : {};
            
            if (renderRow) {
              return renderRow(row, rowIndex);
            }

            return (
              <tr key={rowKey} className={cn(
                hoverable && 'hover:bg-gray-50 transition-colors',
                striped && rowIndex % 2 === 1 && 'bg-gray-50'
              )} {...rowProps}>
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', col.className)}>
                    {col.render ? col.render(row, rowIndex) : row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page * pagination.limit >= pagination.total}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;