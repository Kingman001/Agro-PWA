import React from 'react';
import {
  Users,
  MapPin,
  ClipboardCheck,
  Warehouse,
  AlertTriangle,
  TrendingUp,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  Farmer,
  FarmPlot,
  FieldMonitoringLog,
  WarehouseTransaction,
  ComputedWarehouseBalance,
  UserRole,
} from '../../types';
import { AppModuleId } from '../common/Sidebar';

interface DashboardProps {
  farmers: Farmer[];
  plots: FarmPlot[];
  monitoringLogs: FieldMonitoringLog[];
  warehouseBalances: ComputedWarehouseBalance[];
  transactions: WarehouseTransaction[];
  activeRole: UserRole;
  onNavigate: (module: AppModuleId) => void;
  onOpenRegisterFarmer: () => void;
  onOpenNewMonitoring: () => void;
  onOpenNewTransaction: () => void;
}

export const DashboardModule: React.FC<DashboardProps> = ({
  farmers,
  plots,
  monitoringLogs,
  warehouseBalances,
  transactions,
  activeRole,
  onNavigate,
  onOpenRegisterFarmer,
  onOpenNewMonitoring,
  onOpenNewTransaction,
}) => {
  // Aggregate KPI metrics
  const totalFarmers = farmers.length;
  const activeFarmers = farmers.filter((f) => f.status === 'Active').length;
  const pendingFarmers = farmers.filter((f) => f.status === 'Pending Verification').length;

  const totalMappedHa = plots.reduce((acc, p) => acc + (Number(p.areaHectares) || 0), 0).toFixed(1);
  const totalPlots = plots.length;

  const severePests = monitoringLogs.filter((m) => m.pestSeverity === 'Severe' || m.status === 'Action Required').length;
  const lowStockItems = warehouseBalances.filter((b) => b.status === 'Low Stock' || b.status === 'Critical');

  const produceBalance = warehouseBalances
    .filter((b) => b.category === 'PRODUCE')
    .reduce((acc, b) => acc + b.currentStock, 0);

  const inputsBalance = warehouseBalances
    .filter((b) => b.category === 'INPUT')
    .reduce((acc, b) => acc + b.currentStock, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Launchers */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Glean Agro Operational Hub • Season 2026/27</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Agricultural Operations Management
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Real-time tracker replacing disconnected spreadsheets. Full traceability across registered smallholders, GPS polygon boundaries, agronomic field visits, and audit-grade warehouse ledgers.
            </p>
          </div>

          {/* Quick Launch Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {['Administrator', 'Registration Officer', 'Field Officer'].includes(activeRole) && (
              <button
                onClick={onOpenRegisterFarmer}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4 text-stone-950" />
                <span>Register Farmer</span>
              </button>
            )}

            {['Administrator', 'Field Officer'].includes(activeRole) && (
              <button
                onClick={onOpenNewMonitoring}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-900 text-xs font-bold shadow-sm transition"
              >
                <ClipboardCheck className="w-4 h-4 text-emerald-700" />
                <span>Field Inspection</span>
              </button>
            )}

            {['Administrator', 'Warehouse Officer'].includes(activeRole) && (
              <button
                onClick={onOpenNewTransaction}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition"
              >
                <Warehouse className="w-4 h-4 text-emerald-400" />
                <span>Log Stock Movement</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Farmers */}
        <div
          onClick={() => onNavigate('registry')}
          className="bg-white rounded-xl p-4 border border-stone-200 shadow-2xs hover:border-emerald-600 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Farmers Registered</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">{totalFarmers}</span>
            <span className="text-xs text-emerald-700 font-medium">({activeFarmers} Active)</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Pending verification:</span>
            <span className="font-semibold text-amber-700">{pendingFarmers}</span>
          </div>
        </div>

        {/* Card 2: Farm Plots */}
        <div
          onClick={() => onNavigate('mapping')}
          className="bg-white rounded-xl p-4 border border-stone-200 shadow-2xs hover:border-emerald-600 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Mapped Land Area</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">{totalMappedHa}</span>
            <span className="text-xs text-stone-600 font-medium">Hectares</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Mapped plots:</span>
            <span className="font-semibold text-stone-700">{totalPlots} fields</span>
          </div>
        </div>

        {/* Card 3: Field Monitoring & Pest Alerts */}
        <div
          onClick={() => onNavigate('monitoring')}
          className="bg-white rounded-xl p-4 border border-stone-200 shadow-2xs hover:border-amber-600 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Field Inspections</span>
            <div
              className={`p-2 rounded-lg transition ${
                severePests > 0
                  ? 'bg-amber-100 text-amber-800 group-hover:bg-amber-700 group-hover:text-white'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">{monitoringLogs.length}</span>
            <span className="text-xs text-stone-600 font-medium">Visits logged</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between">
            <span className="flex items-center gap-1 text-amber-700 font-semibold">
              <AlertTriangle className="w-3 h-3 text-amber-600" /> Action Required:
            </span>
            <span className="font-bold text-amber-700">{severePests} plots</span>
          </div>
        </div>

        {/* Card 4: Warehouse Aggregation */}
        <div
          onClick={() => onNavigate('warehouse')}
          className="bg-white rounded-xl p-4 border border-stone-200 shadow-2xs hover:border-emerald-600 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Warehouse Produce Stock</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">{produceBalance.toLocaleString()}</span>
            <span className="text-xs text-stone-600 font-medium">Bags produce</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Inputs on hand:</span>
            <span className="font-semibold text-emerald-700">{inputsBalance.toLocaleString()} bags/gal</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Crop Distribution & Stock Ledger Alert Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Operations Summary & Agronomic Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Required Field Alerts */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-stone-900">
                  Priority Agronomic Alerts ({severePests})
                </h2>
              </div>
              <button
                onClick={() => onNavigate('monitoring')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                View all monitoring &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {monitoringLogs
                .filter((m) => m.pestSeverity === 'Severe' || m.status === 'Action Required')
                .map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{log.plotCode}</span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-700 font-medium">{log.farmerName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                          {log.pestSeverity} Pest Severity
                        </span>
                      </div>
                      <p className="text-stone-600 line-clamp-1">{log.issuesDetected}</p>
                      <p className="text-stone-700 font-semibold text-[11px]">
                        Recommendation: {log.recommendations}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-stone-600 font-mono block">
                        Visited: {log.visitDate}
                      </span>
                      <span className="text-[11px] text-stone-600">Officer: {log.officerName}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Warehouse Transactions Ledger */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm font-bold text-stone-900">
                  Recent Traceable Warehouse Ledger Movements
                </h2>
              </div>
              <button
                onClick={() => onNavigate('warehouse')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                Open Full Ledger &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-600 uppercase text-[10px] font-semibold">
                    <th className="py-2 px-2">TX Ref</th>
                    <th className="py-2 px-2">Type</th>
                    <th className="py-2 px-2">Item</th>
                    <th className="py-2 px-2 text-right">Quantity</th>
                    <th className="py-2 px-2">Authorized By</th>
                    <th className="py-2 px-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                  {transactions.slice(0, 5).map((tx) => (
                    <tr key={tx.id} className="hover:bg-stone-50">
                      <td className="py-2 px-2 font-semibold text-stone-900">{tx.transactionNumber}</td>
                      <td className="py-2 px-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            tx.transactionType === 'RECEIPT' || tx.transactionType === 'RETURN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.transactionType === 'ISSUE' || tx.transactionType === 'DISPATCH'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tx.transactionType}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-sans text-stone-800 truncate max-w-[180px]">
                        {tx.itemName}
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-stone-900">
                        {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                      </td>
                      <td className="py-2 px-2 font-sans text-stone-600">{tx.authorizedBy}</td>
                      <td className="py-2 px-2 text-stone-600">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Warehouse Stock Health & Fast Tools */}
        <div className="space-y-6">
          {/* Low Stock Warning Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center justify-between">
              <span>Inventory Stock Status</span>
              <span className="text-xs text-stone-600">
                {lowStockItems.length} below reorder
              </span>
            </h3>

            <div className="space-y-3">
              {warehouseBalances.slice(0, 5).map((bal) => {
                const percent = Math.min(
                  Math.round((bal.currentStock / (bal.reorderLevel * 2)) * 100),
                  100
                );

                return (
                  <div key={bal.itemId} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-800 truncate max-w-[170px]">
                        {bal.itemName}
                      </span>
                      <span className="font-bold text-stone-900">
                        {bal.currentStock} {bal.unitOfMeasure.split(' ')[0]}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          bal.status === 'Critical'
                            ? 'bg-red-500'
                            : bal.status === 'Low Stock'
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-stone-600">
                      <span>Reorder threshold: {bal.reorderLevel}</span>
                      <span
                        className={`font-semibold ${
                          bal.status === 'Critical'
                            ? 'text-red-700'
                            : bal.status === 'Low Stock'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {bal.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PWA & Offline Readiness Panel */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-stone-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Offline-First PWA Capabilities</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Equipped with IndexedDB persistent draft stores for field registration and agronomic surveys in remote rural zones lacking continuous mobile network coverage.
            </p>
            <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px] font-semibold text-emerald-900">
              <span>Service Worker Status:</span>
              <span className="text-emerald-700">Active (Auto-caching)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
