import React, { useState } from 'react';
import { PlusCircle, ExternalLink, AlertTriangle, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { FieldMonitoringLog, FarmPlot, UserRole } from '../../types';
import { SpreadsheetTable, ColumnDef, SavedView } from '../common/SpreadsheetTable';
import { MonitoringFormModal } from './MonitoringFormModal';

interface MonitoringProps {
  logs: FieldMonitoringLog[];
  plots: FarmPlot[];
  onAddLog: (log: FieldMonitoringLog, isDraft: boolean) => void;
  onUpdateLogStatus: (logId: string, status: FieldMonitoringLog['status']) => void;
  onImportLogs: (rows: Record<string, string>[]) => void;
  activeRole: UserRole;
  currentUserId: string;
  currentUserName: string;
}

export const FieldMonitoringModule: React.FC<MonitoringProps> = ({
  logs,
  plots,
  onAddLog,
  onUpdateLogStatus,
  onImportLogs,
  activeRole,
  currentUserId,
  currentUserName,
}) => {
  const [selectedLog, setSelectedLog] = useState<FieldMonitoringLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeViewId, setActiveViewId] = useState('all');

  const canCreate = ['Administrator', 'Field Officer'].includes(activeRole);
  const canReview = ['Administrator', 'Field Supervisor'].includes(activeRole);

  const savedViews: SavedView<FieldMonitoringLog>[] = [
    {
      id: 'all',
      label: 'All Field Visits',
      predicate: () => true,
      badgeCount: logs.length,
    },
    {
      id: 'action_required',
      label: 'Action Required',
      predicate: (l) => l.status === 'Action Required' || l.pestSeverity === 'Severe',
      badgeCount: logs.filter((l) => l.status === 'Action Required' || l.pestSeverity === 'Severe').length,
    },
    {
      id: 'severe_pests',
      label: 'Severe Infestations',
      predicate: (l) => l.pestSeverity === 'Severe',
      badgeCount: logs.filter((l) => l.pestSeverity === 'Severe').length,
    },
    {
      id: 'reviewed',
      label: 'Supervisor Reviewed',
      predicate: (l) => l.status === 'Reviewed',
      badgeCount: logs.filter((l) => l.status === 'Reviewed').length,
    },
  ];

  const columns: ColumnDef<FieldMonitoringLog>[] = [
    {
      key: 'logNumber',
      header: 'Log Ref',
      width: '120px',
      sortable: true,
      render: (l) => (
        <span className="font-mono font-bold text-stone-900 flex items-center gap-1">
          {l.logNumber}
          {l.syncStatus === 'local_draft' && (
            <span
              className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
              title="Local offline draft"
            />
          )}
        </span>
      ),
    },
    {
      key: 'plotCode',
      header: 'Plot & Farmer',
      sortable: true,
      render: (l) => (
        <div>
          <div className="font-mono font-bold text-emerald-800">{l.plotCode}</div>
          <div className="text-stone-700 font-medium">{l.farmerName}</div>
        </div>
      ),
    },
    {
      key: 'visitDate',
      header: 'Inspection Date',
      sortable: true,
      render: (l) => <span className="font-mono text-stone-700">{l.visitDate}</span>,
    },
    {
      key: 'cropStage',
      header: 'Crop Stage',
      sortable: true,
      render: (l) => <span className="text-stone-800 font-medium">{l.cropStage}</span>,
    },
    {
      key: 'pestSeverity',
      header: 'Pest Severity',
      sortable: true,
      filterable: true,
      filterOptions: ['None', 'Low', 'Moderate', 'Severe'],
      render: (l) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            l.pestSeverity === 'Severe'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : l.pestSeverity === 'Moderate'
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : l.pestSeverity === 'Low'
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
        >
          {l.pestSeverity}
        </span>
      ),
    },
    {
      key: 'weedPressure',
      header: 'Weeds',
      sortable: true,
      render: (l) => (
        <span
          className={`font-medium ${
            l.weedPressure === 'Heavy' ? 'text-red-700 font-bold' : 'text-stone-700'
          }`}
        >
          {l.weedPressure}
        </span>
      ),
    },
    {
      key: 'soilMoisture',
      header: 'Moisture',
      sortable: true,
      render: (l) => <span className="text-stone-700">{l.soilMoisture}</span>,
    },
    {
      key: 'estimatedYieldBags',
      header: 'Yield Est',
      sortable: true,
      align: 'right',
      render: (l) => (
        <span className="font-mono font-bold text-stone-900">{l.estimatedYieldBags} bags</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Submitted', 'Reviewed', 'Action Required'],
      render: (l) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            l.status === 'Action Required'
              ? 'bg-red-50 text-red-700 border border-red-300'
              : l.status === 'Reviewed'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-stone-100 text-stone-700'
          }`}
        >
          {l.status}
        </span>
      ),
    },
    {
      key: 'officerName',
      header: 'Scout Officer',
      sortable: true,
      render: (l) => <span className="text-stone-600">{l.officerName}</span>,
    },
    {
      key: 'actions',
      header: 'View',
      sortable: false,
      align: 'center',
      render: (l) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(l);
          }}
          className="p-1 rounded text-stone-500 hover:text-emerald-700 hover:bg-stone-100"
          title="Open inspection details"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SpreadsheetTable<FieldMonitoringLog>
        title="Agronomic Field Monitoring Tracker"
        subtitle="GPS-verified pest scouting, crop phenology, moisture stress and intervention recommendations"
        data={logs}
        columns={columns}
        keyExtractor={(l) => l.id}
        savedViews={savedViews}
        activeSavedViewId={activeViewId}
        onSelectSavedView={setActiveViewId}
        onRowClick={(l) => setSelectedLog(l)}
        exportFilename="glean-agro-field-monitoring"
        onImportData={onImportLogs}
        actionButton={
          canCreate ? (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Field Visit</span>
            </button>
          ) : undefined
        }
      />

      {/* Field Inspection Details Drawer / Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold">
                    {selectedLog.logNumber}
                  </span>
                  <span className="text-stone-400">•</span>
                  <h3 className="font-bold text-base">{selectedLog.plotCode}</h3>
                </div>
                <p className="text-xs text-stone-400">
                  Inspected for {selectedLog.farmerName} on {selectedLog.visitDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <span className="text-stone-500 block text-[11px]">Crop Stage</span>
                  <span className="font-bold text-stone-900">{selectedLog.cropStage}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Pest Rating</span>
                  <span className="font-bold text-stone-900">{selectedLog.pestSeverity}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Weed Status</span>
                  <span className="font-bold text-stone-900">{selectedLog.weedPressure}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Yield Projection</span>
                  <span className="font-bold text-stone-900">
                    {selectedLog.estimatedYieldBags} Bags
                  </span>
                </div>
              </div>

              {selectedLog.pestNames && selectedLog.pestNames.length > 0 && (
                <div>
                  <span className="font-semibold text-stone-800 block mb-1">
                    Pathogens & Pests Identified:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLog.pestNames.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200 font-medium text-[11px]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="font-bold text-stone-800 block mb-0.5">
                    Documented Symptoms & Issues:
                  </span>
                  <p className="text-stone-700 leading-relaxed">{selectedLog.issuesDetected}</p>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                  <span className="font-bold text-emerald-950 block mb-0.5">
                    Officer Recommendations:
                  </span>
                  <p className="text-emerald-900 leading-relaxed">
                    {selectedLog.recommendations}
                  </p>
                </div>
              </div>

              {selectedLog.photoUrl && (
                <div>
                  <span className="font-semibold text-stone-800 block mb-1">
                    Field Photographic Evidence:
                  </span>
                  <div className="rounded-xl overflow-hidden border border-stone-200 max-h-60">
                    <img
                      src={selectedLog.photoUrl}
                      alt="Crop symptom evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-stone-200 grid grid-cols-2 gap-2 text-[11px] text-stone-500 font-mono">
                <div>
                  Officer: {selectedLog.officerName} ({selectedLog.officerId})
                </div>
                <div>
                  GPS: {selectedLog.latitude.toFixed(4)}, {selectedLog.longitude.toFixed(4)} (&plusmn;
                  {selectedLog.gpsAccuracyMeters}m)
                </div>
              </div>
            </div>

            {/* Supervisor Review Action */}
            <div className="bg-stone-50 border-t border-stone-200 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-600">Review Status:</span>
                {canReview ? (
                  <select
                    value={selectedLog.status}
                    onChange={(e) =>
                      onUpdateLogStatus(selectedLog.id, e.target.value as any)
                    }
                    className="bg-white border border-stone-300 rounded px-2.5 py-1 text-xs font-semibold text-stone-800 focus:outline-none"
                  >
                    <option value="Submitted">Submitted (Pending Review)</option>
                    <option value="Reviewed">Reviewed & Approved</option>
                    <option value="Action Required">Action Required (Escalate)</option>
                  </select>
                ) : (
                  <span className="text-xs font-bold text-stone-700">
                    {selectedLog.status} (Read-only)
                  </span>
                )}
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Monitoring Inspection Form Modal */}
      {showModal && (
        <MonitoringFormModal
          plots={plots}
          onClose={() => setShowModal(false)}
          onSubmitLog={onAddLog}
          activeRole={activeRole}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      )}
    </div>
  );
};
