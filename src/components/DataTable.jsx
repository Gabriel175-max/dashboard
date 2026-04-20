import React, { useMemo, useState } from 'react';
import { fmt } from '../lib/format.js';

/**
 * columns: [
 *   { key, label, align?: 'left'|'right', format?: 'int'|'dec'|'pct'|fn, mono?: bool,
 *     width?: string, render?: (row)=>ReactNode, sortable?: bool }
 * ]
 */
export default function DataTable({
  columns,
  rows,
  kicker,
  title,
  subtitle,
  empty = 'Sem dados no período.',
  maxRows = 12,
  className = ''
}) {
  const [sort, setSort] = useState(null);

  const sorted = useMemo(() => {
    const data = Array.isArray(rows) ? rows.slice(0, maxRows) : [];
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return data;
    return [...data].sort((a, b) => {
      const va = a[sort.key];
      const vb = b[sort.key];
      const na = typeof va === 'number' ? va : parseFloat(va);
      const nb = typeof vb === 'number' ? vb : parseFloat(vb);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) {
        return sort.dir === 'asc' ? na - nb : nb - na;
      }
      return sort.dir === 'asc'
        ? String(va ?? '').localeCompare(String(vb ?? ''))
        : String(vb ?? '').localeCompare(String(va ?? ''));
    });
  }, [rows, sort, columns, maxRows]);

  const toggleSort = (col) => {
    if (col.sortable === false) return;
    setSort((s) => {
      if (!s || s.key !== col.key) return { key: col.key, dir: 'desc' };
      if (s.dir === 'desc') return { key: col.key, dir: 'asc' };
      return null;
    });
  };

  const formatCell = (col, row) => {
    if (col.render) return col.render(row);
    const v = row[col.key];
    if (typeof col.format === 'function') return col.format(v, row);
    if (col.format && fmt[col.format]) return fmt[col.format](v);
    return v ?? '—';
  };

  return (
    <div className={`card ${className}`}>
      {(title || kicker) && (
        <>
          <div className="card-head">
            <div>
              {kicker && <div className="label-xs mb-1.5">{kicker}</div>}
              {title && (
                <h3 className="font-display text-[20px] tracking-tight text-bone-50 leading-tight">
                  {title}
                </h3>
              )}
              {subtitle && <p className="mt-1 text-[12.5px] text-bone-400">{subtitle}</p>}
            </div>
          </div>
          <div className="rule mx-5" />
        </>
      )}

      <div className="px-1.5 pb-2 pt-1 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-bone-500">
              {columns.map((col) => {
                const isSorted = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col)}
                    style={{ width: col.width }}
                    className={[
                      'label-xs font-sans px-3.5 py-3 select-none',
                      col.align === 'right' ? 'text-right' : 'text-left',
                      col.sortable === false ? 'cursor-default' : 'cursor-pointer hover:text-bone-200 transition-colors'
                    ].join(' ')}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.label}
                      {isSorted && (
                        <span className="text-amber-500 text-[9px]">
                          {sort.dir === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3.5 py-10 text-center text-bone-500 italic font-display"
                >
                  {empty}
                </td>
              </tr>
            )}
            {sorted.map((row, i) => (
              <tr
                key={row.id ?? row.key ?? i}
                className="border-t border-bone-600/15 hover:bg-ink-800/40 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={[
                      'px-3.5 py-2.5 align-middle',
                      col.align === 'right' ? 'text-right' : 'text-left',
                      col.mono || col.align === 'right' ? 'num text-bone-100' : 'text-bone-100',
                      col.muted ? 'text-bone-300' : ''
                    ].join(' ')}
                  >
                    {formatCell(col, row)}
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
