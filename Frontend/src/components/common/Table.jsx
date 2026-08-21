import { useEffect, useMemo, useRef, useState } from 'react';

// ── Row action dropdown ───────────────────────────────────────────────────────
export function RowActions({ actions = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const visible = actions.filter((a) => !a.hidden);
  if (visible.length === 0) return null;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
        aria-label="Row actions"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-[160px] rounded-xl border border-[#E2E8F0] bg-white py-1 shadow-lg">
          {visible.map((action) => (
            <button
              key={action.label}
              type="button"
              disabled={action.disabled}
              onClick={() => { setOpen(false); action.onClick(); }}
              className={`flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                action.variant === 'danger'
                  ? 'text-[#DC2626] hover:bg-[#FEF2F2]'
                  : action.variant === 'warning'
                    ? 'text-[#D97706] hover:bg-[#FFFBEB]'
                    : action.variant === 'success'
                      ? 'text-[#059669] hover:bg-[#ECFDF5]'
                      : 'text-[#334155] hover:bg-[#F8FAFC]'
              }`}
            >
              {action.icon && <span className="shrink-0">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getComparableValue(row, column) {
  const value = column.sortValue ? column.sortValue(row) : row[column.key];

  if (value === null || value === undefined) {
    return '';
  }

  return typeof value === 'string' ? value.toLowerCase() : value;
}

function Table({ columns = [], data = [], emptyMessage = 'No records available.' }) {
  const [sort, setSort] = useState({ key: '', direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sort.key) {
      return data;
    }

    const column = columns.find((item) => item.key === sort.key);
    if (!column) {
      return data;
    }

    return [...data].sort((first, second) => {
      const firstValue = getComparableValue(first, column);
      const secondValue = getComparableValue(second, column);

      if (firstValue < secondValue) return sort.direction === 'asc' ? -1 : 1;
      if (firstValue > secondValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [columns, data, sort]);

  const toggleSort = (column) => {
    if (column.sortable === false || column.key === 'actions') {
      return;
    }

    setSort((current) => ({
      key: column.key,
      direction: current.key === column.key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="rounded-lg bg-[#FFFFFF] md:overflow-x-auto md:border md:border-[#334155]/15">
      <table className="block min-w-full text-left text-sm md:table md:divide-y md:divide-[#334155]/15">
        <thead className="hidden bg-[#2563EB]/10 md:table-header-group">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold text-[#334155]">
                {column.sortable === false || column.key === 'actions' ? (
                  column.header
                ) : (
                  <button type="button" className="inline-flex items-center gap-2 text-left font-semibold" onClick={() => toggleSort(column)}>
                    <span>{column.header}</span>
                    <span className="text-xs font-medium text-[#334155]/70">
                      {sort.key === column.key ? (sort.direction === 'asc' ? 'up' : 'down') : 'sort'}
                    </span>
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="block space-y-4 md:table-row-group md:space-y-0 md:divide-y md:divide-[#334155]/15">
          {sortedData.length > 0 ? (
            sortedData.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="block overflow-hidden rounded-xl border border-[#334155]/15 bg-white shadow-sm md:table-row md:rounded-none md:border-0 md:shadow-none"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="grid grid-cols-[minmax(7rem,40%)_1fr] gap-3 border-b border-[#334155]/10 px-4 py-3 align-top text-[#334155] last:border-b-0 md:table-cell md:max-w-[18rem] md:border-b-0"
                  >
                    <span className="font-semibold text-[#334155]/70 md:hidden">{column.header}</span>
                    <div className="min-w-0">{column.render ? column.render(row) : row[column.key]}</div>
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="block rounded-xl border border-[#334155]/15 md:table-row md:rounded-none md:border-0">
              <td colSpan={columns.length || 1} className="block px-4 py-8 text-center text-sm text-[#334155]/80 md:table-cell">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
