import React from 'react';
import {
  X,
  Phone,
  MapPin,
  Calendar,
  Building,
  Sprout,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { Farmer, FarmPlot, FieldMonitoringLog, UserRole } from '../../types';

interface DetailProps {
  farmer: Farmer;
  plots: FarmPlot[];
  monitoringLogs: FieldMonitoringLog[];
  onClose: () => void;
  onUpdateStatus: (farmerId: string, newStatus: Farmer['status']) => void;
  activeRole: UserRole;
}

export const FarmerDetailModal: React.FC<DetailProps> = ({
  farmer,
  plots,
  monitoringLogs,
  onClose,
  onUpdateStatus,
  activeRole,
}) => {
  const farmerPlots = plots.filter((p) => p.farmerId === farmer.id);
  const farmerLogs = monitoringLogs.filter((m) => m.farmerId === farmer.id);
  const canApprove = ['Administrator', 'Field Supervisor'].includes(activeRole);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 border border-emerald-600 flex items-center justify-center overflow-hidden shrink-0">
              {farmer.photoUrl ? (
                <img
                  src={farmer.photoUrl}
                  alt={farmer.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-bold text-emerald-200">
                  {farmer.fullName.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{farmer.fullName}</h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    farmer.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {farmer.status}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono">
                Reg: {farmer.registrationNumber} • National ID: {farmer.nationalId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Section 1: Demographics & Contact */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <span className="text-[11px] text-stone-500 block">Phone Contact</span>
              <span className="font-semibold text-stone-900 flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                {farmer.phone}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-stone-500 block">Location</span>
              <span className="font-semibold text-stone-900 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {farmer.community}, {farmer.district}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-stone-500 block">Cooperative</span>
              <span className="font-semibold text-stone-900 flex items-center gap-1 mt-0.5">
                <Building className="w-3.5 h-3.5 text-stone-400" />
                {farmer.cooperative}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-stone-500 block">Primary Enterprise</span>
              <span className="font-semibold text-stone-900 flex items-center gap-1 mt-0.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                {farmer.primaryCrop} ({farmer.farmSizeEstimateHa} Ha)
              </span>
            </div>
          </div>

          {/* Section 2: Farm Plots Associated */}
          <div className="space-y-2">
            <h3 className="font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Mapped Farm Plots ({farmerPlots.length})</span>
            </h3>

            {farmerPlots.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-stone-200 text-stone-500 text-center">
                No GIS mapped plots registered yet for this farmer.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {farmerPlots.map((plot) => (
                  <div
                    key={plot.id}
                    className="p-3.5 bg-white rounded-xl border border-stone-200 space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-stone-900">{plot.plotCode}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                        {plot.areaHectares} Ha
                      </span>
                    </div>
                    <p className="text-stone-600">{plot.locationName}</p>
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>Crops: {plot.cropTypes.join(', ')}</span>
                      <span className="font-mono text-emerald-700">
                        GPS: {plot.latitude.toFixed(3)}, {plot.longitude.toFixed(3)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Recent Field Monitoring Inspections */}
          <div className="space-y-2">
            <h3 className="font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Inspection History ({farmerLogs.length})</span>
            </h3>

            {farmerLogs.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-stone-200 text-stone-500 text-center">
                No agronomic field inspection logs recorded for this farmer.
              </div>
            ) : (
              <div className="space-y-2">
                {farmerLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-start justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-stone-900">
                          {log.logNumber}
                        </span>
                        <span className="text-stone-400">•</span>
                        <span>Stage: {log.cropStage}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            log.pestSeverity === 'Severe'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Pest: {log.pestSeverity}
                        </span>
                      </div>
                      <p className="text-stone-600">{log.issuesDetected}</p>
                      <p className="text-emerald-900 font-medium">Rec: {log.recommendations}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-stone-500 font-mono block">
                        {log.visitDate}
                      </span>
                      <span className="text-[11px] text-stone-400">By {log.officerName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Audit & Enrollment Attribution */}
          <div className="pt-3 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Enrolled by: {farmer.registeredByName || farmer.registeredBy}</span>
            <span>Registration timestamp: {new Date(farmer.registeredAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Footer actions with Role Authorization for Approval */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600">Verification Status:</span>
            {canApprove ? (
              <select
                value={farmer.status}
                onChange={(e) => onUpdateStatus(farmer.id, e.target.value as any)}
                className="bg-white border border-stone-300 rounded px-2.5 py-1 text-xs font-semibold text-stone-800 focus:outline-none"
              >
                <option value="Active">Active (Verified)</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Suspended">Suspended</option>
              </select>
            ) : (
              <span className="text-xs font-bold text-stone-700">{farmer.status} (Read-only)</span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
