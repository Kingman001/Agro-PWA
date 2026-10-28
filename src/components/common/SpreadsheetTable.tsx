import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { exportToCSV, parseCSV } from '../../services/exportImport';

export interface ColumnDef<T> {
  key: string;
  header: string;
  accessor?: (item: T) => any;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: string[];
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SavedView<T> {
  id: string;
  label: string;
  predicate: (item: T) => boolean;
  badgeCount?: number;
}

interface SpreadsheetTableProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  savedViews?: SavedView<T>[];
  activeSavedViewId?: string;
  onSelectSavedView?: (viewId: string) => void;
  onRowClick?: (item: T) => void;
  onImportData?: (importedRows: Record<string, string>[]) => void;
  exportFilename?: string;
  actionButton?: React.ReactNode;
  canExport?: boolean;
  canImport?: boolean;
}

export function SpreadsheetTable<T extends Record<string, any>>({
  title,
  subtitle,
  data,
  columns,
  keyExtractor,
  savedViews = [],
  activeSavedViewId,
  onSelectSavedView,
  onRowClick,
  onImportData,
  exportFilename = 'glean-agro-export',
  actionButton,
  canExport = true,
  canImport = true,
}: SpreadsheetTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 1. Filter by active saved view
  const viewFilteredData = useMemo(() => {
    if (!activeSavedViewId || !savedViews.length) return data;
    const currentView = savedViews.find((v) => v.id === activeSavedViewId);
    if (!currentView) return data;
    return data.filter(currentView.predicate);
  }, [data, activeSavedViewId, savedViews]);

  // 2. Filter by search query
  const searchFilteredData = useMemo(() => {
    if (!searchQuery.trim()) return viewFilteredData;
    const q = searchQuery.toLowerCase();
    return viewFilteredData.filter((item) => {
      return Object.values(item).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') {
          return JSON.stringify(val).toLowerCase().includes(q);
        }
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [viewFilteredData, searchQuery]);

  // 3. Filter by column filters
  const fullyFilteredData = useMemo(() => {
    return searchFilteredData.filter((item) => {
      for (const [colKey, filterValue] of Object.entries(columnFilters)) {
        if (!filterValue || filterValue === 'ALL') continue;
        const col = columns.find((c) => c.key === colKey);
        const itemVal = col?.accessor ? col.accessor(item) : item[colKey];
        if (String(itemVal) !== filterValue) {
          return false;
        }
      }
      return true;
    });
  }, [searchFilteredData, columnFilters, columns]);

  // 4. Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return fullyFilteredData;
    const col = columns.find((c) => c.key === sortKey);

    return [...fullyFilteredData].sort((a, b) => {
      const valA = col?.accessor ? col.accessor(a) : a[sortKey];
      const valB = col?.accessor ? col.accessor(b) : b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [fullyFilteredData, sortKey, sortDirection, columns]);

  // 5. Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    exportToCSV(exportFilename, sortedData);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportData) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const rows = parseCSV(text);
        onImportData(rows);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      const newSelected = new Set(paginatedData.map((d) => keyExtractor(d)));
      setSelectedIds(newSelected);
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col">
      {/* Top Header & Actions Bar */}
      <div className="p-4 border-b border-stone-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-stone-900 tracking-tight">{title}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono font-medium">
              {totalItems} records
            </span>
          </div>
          {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {actionButton}

          {canExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-2xs transition"
              title="Export filtered records to spreadsheet CSV"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Export CSV</span>
            </button>
          )}

          {canImport && onImportData && (
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-2xs transition cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-stone-500" />
              <span>Import CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Saved Views Pills */}
      {savedViews.length > 0 && (
        <div className="px-4 py-2 bg-stone-50/80 border-b border-stone-200 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Views:
          </span>
          {savedViews.map((view) => {
            const isSelected = activeSavedViewId === view.id;
            return (
              <button
                key={view.id}
                onClick={() => onSelectSavedView && onSelectSavedView(view.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-white text-stone-600 hover:bg-stone-200/80 border border-stone-200'
                }`}
              >
                {view.label}
                {view.badgeCount !== undefined && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {view.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Search and Column Filters Bar */}
      <div className="p-3 bg-stone-50/40 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search within table (names, codes, districts, batches)..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>

        {/* Column Specific Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {columns
            .filter((c) => c.filterable && c.filterOptions)
            .map((col) => (
              <select
                key={col.key}
                value={columnFilters[col.key] || 'ALL'}
                onChange={(e) => {
                  setColumnFilters((prev) => ({
                    ...prev,
                    [col.key]: e.target.value,
                  }));
                  setCurrentPage(1);
                }}
                className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="ALL">All {col.header}s</option>
                {col.filterOptions?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ))}

          {Object.keys(columnFilters).length > 0 &&
            Object.values(columnFilters).some((v) => v !== 'ALL') && (
              <button
                onClick={() => setColumnFilters({})}
                className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold px-2 py-1"
              >
                Clear Filters
              </button>
            )}
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 font-semibold tracking-wider uppercase text-[11px] select-none">
              <th className="py-2.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    paginatedData.length > 0 &&
                    selectedIds.size === paginatedData.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-stone-300 cursor-pointer"
                />
              </th>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={`py-2.5 px-3 font-semibold ${
                      col.sortable !== false
                        ? 'cursor-pointer hover:bg-stone-200/80 transition-colors'
                        : ''
                    } ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1 ${
                        col.align === 'right'
                          ? 'justify-end'
                          : col.align === 'center'
                          ? 'justify-center'
                          : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable !== false && (
                        <span className="text-stone-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-emerald-700 font-bold" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-emerald-700 font-bold" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/80 font-sans">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-12 text-center text-stone-400 italic"
                >
                  No matching records found in this view or filter criteria.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => {
                const id = keyExtractor(item);
                const isSelected = selectedIds.has(id);

                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 hover:bg-emerald-50'
                        : idx % 2 === 0
                        ? 'bg-white hover:bg-stone-50'
                        : 'bg-stone-50/40 hover:bg-stone-100/70'
                    }`}
                  >
                    <td
                      className="py-2 px-3 text-center"
                      onClick={(e) => toggleSelectOne(id, e)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-emerald-600 focus:ring-emerald-500 border-stone-300 cursor-pointer"
                      />
                    </td>
                    {columns.map((col) => {
                      const content = col.render
                        ? col.render(item)
                        : col.accessor
                        ? col.accessor(item)
                        : item[col.key];

                      return (
                        <td
                          key={col.key}
                          className={`py-2 px-3 ${
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          }`}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-stone-200 bg-stone-50/80 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
        <div className="flex items-center gap-3">
          <span>
            Showing{' '}
            <strong className="text-stone-900">
              {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-stone-900">
              {Math.min(currentPage * pageSize, totalItems)}
            </strong>{' '}
            of <strong className="text-stone-900">{totalItems}</strong> entries
          </span>

          {selectedIds.size > 0 && (
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-medium">
              {selectedIds.size} row(s) selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 text-[11px]">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-stone-200 rounded px-2 py-1 text-xs focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded border border-stone-200 bg-white text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-semibold text-stone-800">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded border border-stone-200 bg-white text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
