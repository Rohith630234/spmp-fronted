import React from 'react';

/**
 * Reusable Responsive Table Component.
 * Supports custom column rendering, empty states, and clean zebra striping.
 */
export const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  className = '',
}) => {
  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 text-sm">Loading records...</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}>
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                scope="col"
                className={`px-4 py-3.5 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-slate-400 font-medium"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className="hover:bg-slate-50/75 transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={`px-4 py-3.5 text-slate-700 ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
