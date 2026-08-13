import React, { useState, useMemo } from 'react';

export function DataTable({
  columns,
  data = [],
  keyExtractor,
  emptyMessage = 'No matching records found.',
  initialSort = null,
}) {
  const [sortConfig, setSortConfig] = useState(initialSort);

  const handleSort = (columnKey) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === columnKey) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig || !Array.isArray(data)) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sortConfig?.key === col.key;
              return (
                <th key={col.key}>
                  {col.sortable !== false ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="table-sort-btn"
                    >
                      <span>{col.header}</span>
                      <span style={{ fontSize: '0.7rem', color: isSorted ? '#2563eb' : '#94a3b8' }}>
                        {isSorted ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '▲▼'}
                      </span>
                    </button>
                  ) : (
                    <span>{col.header}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData && sortedData.length > 0 ? (
            sortedData.map((item) => (
              <tr key={keyExtractor(item)}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
