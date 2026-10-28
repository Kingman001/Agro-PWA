import React, { useState } from 'react';
import {
  Warehouse,
  PlusCircle,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  History,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  WarehouseItem,
  WarehouseTransaction,
  ComputedWarehouseBalance,
  UserRole,
} from '../../types';
import { SpreadsheetTable, ColumnDef, SavedView } from '../common/SpreadsheetTable';
import { NewTransactionModal } from './NewTransactionModal';

interface WarehouseProps {
  items: WarehouseItem[];
  transactions: WarehouseTransaction[];
  balances: ComputedWarehouseBalance[];
  onRecordTransaction: (tx: WarehouseTransaction) => void;
  onImportTransactions: (rows: Record<string, string>[]) => void;
  activeRole: UserRole;
  currentUserId: string;
  currentUserName: string;
}

export const WarehouseModule: React.FC<WarehouseProps> = ({
  items,
  transactions,
  balances,
  onRecordTransaction,
  onImportTransactions,
  activeRole,
  currentUserId,
  currentUserName,
}) => {
  const [activeTab, setActiveTab] = useState<'balances' | 'ledger'>('balances');
  const [showNewTxModal, setShowNewTxModal] = useState(false);
  const [activeBalanceView, setActiveBalanceView] = useState('all');

  const canRecord = ['Administrator', 'Warehouse Officer'].includes(activeRole);

  // --- Saved Views for Balances ---
  const balanceSavedViews: SavedView<ComputedWarehouseBalance>[] = [
    {
      id: 'all',
      label: 'All Commodities & Inputs',
      predicate: () => true,
      badgeCount: balances.length,
    },
    {
      id: 'inputs',
      label: 'Agricultural Inputs',
      predicate: (b) => b.category === 'INPUT',
      badgeCount: balances.filter((b) => b.category === 'INPUT').length,
    },
    {
      id: 'produce',
      label: 'Harvested Produce',
      predicate: (b) => b.category === 'PRODUCE',
      badgeCount: balances.filter((b) => b.category === 'PRODUCE').length,
    },
    {
      id: 'low_stock',
      label: 'Low Stock Reorder Alert',
      predicate: (b) => b.status === 'Low Stock' || b.status === 'Critical',
      badgeCount: balances.filter((b) => b.status === 'Low Stock' || b.status === 'Critical').length,
    },
  ];

  // --- Columns for Computed Balances ---
  const balanceColumns: ColumnDef<ComputedWarehouseBalance>[] = [
    {
      key: 'itemCode',
      header: 'Item Code',
      width: '130px',
      sortable: true,
      render: (b) => <span className="font-mono font-bold text-stone-900">{b.itemCode}</span>,
    },
    {
      key: 'itemName',
      header: 'Description & Specification',
      sortable: true,
      render: (b) => (
        <div>
          <div className="font-semibold text-stone-900">{b.itemName}</div>
          <div className="text-[10px] text-stone-500">{b.category}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      filterable: true,
      filterOptions: ['INPUT', 'PRODUCE'],
      render: (b) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            b.category === 'INPUT'
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {b.category}
        </span>
      ),
    },
    {
      key: 'totalReceipts',
      header: 'Total Inflow (+)',
      sortable: true,
      align: 'right',
      render: (b) => (
        <span className="font-mono text-emerald-800 font-semibold">
          +{b.totalReceipts + b.totalReturns}
        </span>
      ),
    },
    {
      key: 'totalIssues',
      header: 'Total Outflow (-)',
      sortable: true,
      align: 'right',
      render: (b) => (
        <span className="font-mono text-blue-800 font-semibold">
          -{b.totalIssues + b.totalDispatches}
        </span>
      ),
    },
    {
      key: 'totalAdjustments',
      header: 'Audit Adj.',
      sortable: true,
      align: 'right',
      render: (b) => (
        <span className="font-mono text-stone-600 font-medium">
          {b.totalAdjustments > 0 ? `+${b.totalAdjustments}` : b.totalAdjustments}
        </span>
      ),
    },
    {
      key: 'currentStock',
      header: 'Verified Stock',
      sortable: true,
      align: 'right',
      render: (b) => (
        <div className="text-right">
          <span className="font-mono font-bold text-sm text-stone-900">
            {b.currentStock.toLocaleString()}
          </span>
          <span className="text-[10px] text-stone-500 block">
            {b.unitOfMeasure.split(' ')[0]}
          </span>
        </div>
      ),
    },
    {
      key: 'reorderLevel',
      header: 'Reorder Min',
      sortable: true,
      align: 'right',
      render: (b) => <span className="font-mono text-stone-600">{b.reorderLevel}</span>,
    },
    {
      key: 'status',
      header: 'Stock Health',
      sortable: true,
      filterable: true,
      filterOptions: ['In Stock', 'Low Stock', 'Critical'],
      render: (b) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            b.status === 'Critical'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : b.status === 'Low Stock'
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
        >
          {b.status}
        </span>
      ),
    },
  ];

  // --- Columns for Immutable Ledger Transactions ---
  const ledgerColumns: ColumnDef<WarehouseTransaction>[] = [
    {
      key: 'transactionNumber',
      header: 'Journal Ref',
      width: '140px',
      sortable: true,
      render: (t) => <span className="font-mono font-bold text-stone-900">{t.transactionNumber}</span>,
    },
    {
      key: 'timestamp',
      header: 'Date & Time',
      sortable: true,
      render: (t) => (
        <span className="font-mono text-stone-700">
          {new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'transactionType',
      header: 'Movement Type',
      sortable: true,
      filterable: true,
      filterOptions: ['RECEIPT', 'ISSUE', 'TRANSFER', 'DISPATCH', 'RETURN', 'ADJUSTMENT'],
      render: (t) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            t.transactionType === 'RECEIPT' || t.transactionType === 'RETURN'
              ? 'bg-emerald-100 text-emerald-800'
              : t.transactionType === 'ISSUE' || t.transactionType === 'DISPATCH'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {t.transactionType}
        </span>
      ),
    },
    {
      key: 'itemName',
      header: 'Commodity / Input Item',
      sortable: true,
      render: (t) => (
        <div>
          <div className="font-medium text-stone-900">{t.itemName}</div>
          <div className="text-[10px] text-stone-500 font-mono">
            {t.itemCode} {t.batchNumber && `• Batch: ${t.batchNumber}`}
          </div>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      sortable: true,
      align: 'right',
      render: (t) => (
        <span
          className={`font-mono font-bold ${
            t.transactionType === 'RECEIPT' || t.transactionType === 'RETURN'
              ? 'text-emerald-800'
              : t.transactionType === 'ISSUE' || t.transactionType === 'DISPATCH'
              ? 'text-blue-800'
              : 'text-stone-800'
          }`}
        >
          {t.transactionType === 'RECEIPT' || t.transactionType === 'RETURN' ? `+${t.quantity}` : `-${t.quantity}`}{' '}
          <span className="text-[10px] font-normal">{t.unitOfMeasure.split(' ')[0]}</span>
        </span>
      ),
    },
    {
      key: 'referenceDoc',
      header: 'Waybill / Voucher',
      sortable: true,
      render: (t) => <span className="font-mono text-stone-800">{t.referenceDoc}</span>,
    },
    {
      key: 'sourceDestination',
      header: 'Party / Location',
      sortable: true,
      render: (t) => <span className="text-stone-700">{t.sourceDestination}</span>,
    },
    {
      key: 'authorizedBy',
      header: 'Sign-Off Authority',
      sortable: true,
      render: (t) => <span className="text-stone-700 font-medium">{t.authorizedBy}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Switcher & Navigation Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('balances')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'balances'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Verified Stock Balances
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Traceable Movement Journal ({transactions.length})</span>
          </button>
        </div>

        {canRecord && (
          <button
            onClick={() => setShowNewTxModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Movement</span>
          </button>
        )}
      </div>

      {/* Strict Accounting Rule Notice */}
      <div className="p-3 bg-stone-100/80 rounded-xl border border-stone-200 text-xs text-stone-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Traceability Standard:</strong> Inventory is never editable as a standalone balance. Balances are derived dynamically from verified receipts, issues, transfers, dispatches, and adjustments.
          </span>
        </div>
      </div>

      {/* Tab 1: Calculated Stock Balances */}
      {activeTab === 'balances' && (
        <SpreadsheetTable<ComputedWarehouseBalance>
          title="Warehouse Stock Ledger Summary"
          subtitle="Real-time stock balance calculated strictly from chronological transaction journal"
          data={balances}
          columns={balanceColumns}
          keyExtractor={(b) => b.itemId}
          savedViews={balanceSavedViews}
          activeSavedViewId={activeBalanceView}
          onSelectSavedView={setActiveBalanceView}
          exportFilename="glean-agro-warehouse-balances"
        />
      )}

      {/* Tab 2: Immutable Transaction Journal */}
      {activeTab === 'ledger' && (
        <SpreadsheetTable<WarehouseTransaction>
          title="Immutable Stock Movement Journal"
          subtitle="Chronological audit trail of all receipts, issues, transfers, dispatches, and adjustments"
          data={transactions}
          columns={ledgerColumns}
          keyExtractor={(t) => t.id}
          exportFilename="glean-agro-stock-journal"
          onImportData={onImportTransactions}
        />
      )}

      {/* New Transaction Record Modal */}
      {showNewTxModal && (
        <NewTransactionModal
          items={items}
          balances={balances}
          onClose={() => setShowNewTxModal(false)}
          onRecordTransaction={onRecordTransaction}
          activeRole={activeRole}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      )}
    </div>
  );
};
