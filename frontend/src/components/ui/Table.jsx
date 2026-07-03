import React from 'react';
import PropTypes from 'prop-types';
import EmptyState from './EmptyState';

export default function Table({
  columns,
  rows,
  keyField,
  emptyTitle,
  emptyDescription,
}) {
  if (!rows.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className="rounded-2xl border border-dashed border-outline/30"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-outline/20">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-surface-container text-xs uppercase tracking-[0.2em] text-on-surface-variant">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-outline/10">
            {rows.map((row, rowIndex) => (
              <tr
                key={row[keyField] || `${keyField}-${rowIndex}`}
                className="transition hover:bg-surface-container/70"
              >
                {columns.map((column) => (
                  <td
                    key={`${column.key}-${row[keyField] || rowIndex}`}
                    className="px-4 py-4 text-on-surface"
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  keyField: PropTypes.string,
  emptyTitle: PropTypes.string,
  emptyDescription: PropTypes.string,
};

Table.defaultProps = {
  keyField: 'id',
  emptyTitle: 'Sin datos disponibles',
  emptyDescription: 'Aún no hay información para mostrar en esta tabla.',
};
