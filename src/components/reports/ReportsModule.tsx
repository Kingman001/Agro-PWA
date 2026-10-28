import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  MapPin,
  Warehouse,
  PieChart,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  Farmer,
  FarmPlot,
  FieldMonitoringLog,
  ComputedWarehouseBalance,
  UserRole,
} from '../../types';
import { exportToCSV } from '../../services/exportImport';

interface ReportsProps {
  farmers: Farmer[];
  plots: FarmPlot[];
  monitoringLogs: FieldMonitoringLog[];
  balances: ComputedWarehouseBalance[];
  activeRole: UserRole;
}

export const ReportsModule: React.FC<ReportsProps> = ({
  farmers,
  plots,
  monitoringLogs,
  balances,
  activeRole,
}) => {
  // District breakdown
  const districtMap: Record<string, { count: number; ha: number }> = {};
  farmers.forEach((f) => {
    if (!districtMap[f.district]) {
      districtMap[f.district] = { count: 0, ha: 0 };
    }
    districtMap[f.district].count += 1;
    districtMap[f.district].ha += f.farmSizeEstimateHa;
  });

  // Crop distribution breakdown
  const cropMap: Record<string, number> = {};
  plots.forEach((p) => {
    p.cropTypes.forEach((c) => {
      cropMap[c] = (cropMap[c] || 0) + p.areaHectares;
    });
  });

  // Yield projections
  const totalProjectedYieldBags = monitoringLogs.reduce(
    (acc, m) => acc + (m.estimatedYieldBags || 0),
    0
  );

  const handleExportDistrictReport = () => {
    const rows = Object.entries(districtMap).map(([district, stats]) => ({
      District: district,
      RegisteredFarmers: stats.count,
      TotalHectaresEstimated: stats.ha.toFixed(1),
      AverageFarmSizeHa: (stats.ha / stats.count).toFixed(1),
    }));
    exportToCSV('district-operations-report', rows);
  };

  const handleExportCropReport = () => {
    const rows = Object.entries(cropMap).map(([crop, ha]) => ({
      CropName: crop,
      MappedHectares: ha.toFixed(1),
    }));
    exportToCSV('crop-distribution-report', rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            <span>Operational Reports & Agronomic Analytics</span>
          </h2>
          <p className="text-xs text-stone-500">
            Yield forecasting, district land coverage, and warehouse movement velocity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportDistrictReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export District Analytics</span>
          </button>
        </div>
      </div>

      {/* Top Aggregation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">Season Yield Projection</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">
              {totalProjectedYieldBags.toLocaleString()}
            </span>
            <span className="text-xs text-stone-600 font-medium">Bags produce</span>
          </div>
          <p className="mt-1 text-[11px] text-stone-600">
            Derived from {monitoringLogs.length} verified field scout assessments
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">Average Farm Size</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">
              {farmers.length > 0
                ? (
                    farmers.reduce((acc, f) => acc + f.farmSizeEstimateHa, 0) /
                    farmers.length
                  ).toFixed(1)
                : 0}
            </span>
            <span className="text-xs text-stone-600 font-medium">Hectares / Farmer</span>
          </div>
          <p className="mt-1 text-[11px] text-stone-600">Smallholder cluster average</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">Aggregated Crop Diversity</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">
              {Object.keys(cropMap).length}
            </span>
            <span className="text-xs text-stone-600 font-medium">Crops tracked</span>
          </div>
          <p className="mt-1 text-[11px] text-stone-600">Cocoa, Maize, Soybeans, Cassava, Cowpea</p>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Summary Table */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center justify-between">
            <span>District Outreach & Farmer Concentration</span>
            <button
              onClick={handleExportDistrictReport}
              className="text-xs text-emerald-700 hover:underline font-semibold"
            >
              CSV
            </button>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-200 text-stone-600 uppercase text-[10px] font-semibold">
                  <th className="py-2 px-2">District Hub</th>
                  <th className="py-2 px-2 text-right">Registered</th>
                  <th className="py-2 px-2 text-right">Total Ha</th>
                  <th className="py-2 px-2 text-right">Avg Ha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {Object.entries(districtMap).map(([district, stats]) => (
                  <tr key={district} className="hover:bg-stone-50">
                    <td className="py-2 px-2 font-sans font-semibold text-stone-900">{district}</td>
                    <td className="py-2 px-2 text-right text-stone-800">{stats.count}</td>
                    <td className="py-2 px-2 text-right text-emerald-800 font-bold">
                      {stats.ha.toFixed(1)}
                    </td>
                    <td className="py-2 px-2 text-right text-stone-600">
                      {(stats.ha / stats.count).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Crop Land Coverage Breakdown */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center justify-between">
            <span>Crop Enterprise Land Distribution</span>
            <button
              onClick={handleExportCropReport}
              className="text-xs text-emerald-700 hover:underline font-semibold"
            >
              CSV
            </button>
          </h3>

          <div className="space-y-3">
            {Object.entries(cropMap).map(([crop, ha]) => {
              const totalHa = Object.values(cropMap).reduce((a, b) => a + b, 0);
              const percentage = Math.round((ha / totalHa) * 100);

              return (
                <div key={crop} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800">{crop}</span>
                    <span className="font-mono font-bold text-stone-900">
                      {ha.toFixed(1)} Ha ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
