import React, { useState } from 'react';
import {
  History,
  Database,
  Cloud,
  CheckCircle2,
  HardDrive,
  FileCode,
  Shield,
  Layers,
  ArrowRight,
  Server,
} from 'lucide-react';
import { AuditLogEntry, OfflineDraft, UserRole } from '../../types';
import { offlineStorage } from '../../services/offlineStorage';

interface SettingsAuditProps {
  auditLogs: AuditLogEntry[];
  offlineDrafts: OfflineDraft[];
  onClearDrafts: () => void;
  activeRole: UserRole;
}

export const SettingsAuditModule: React.FC<SettingsAuditProps> = ({
  auditLogs,
  offlineDrafts,
  onClearDrafts,
  activeRole,
}) => {
  const [activeSection, setActiveSection] = useState<'audit' | 'architecture' | 'offline_db'>('audit');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-700" />
            <span>Audit Trail & System Architecture Governance</span>
          </h2>
          <p className="text-xs text-stone-500">
            Immutable operational event ledger, offline IndexedDB stores and cloud readiness blueprints
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSection === 'audit'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Audit Trail
          </button>
          <button
            onClick={() => setActiveSection('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSection === 'architecture'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Cloud Architecture & Roadmap
          </button>
          <button
            onClick={() => setActiveSection('offline_db')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSection === 'offline_db'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            IndexedDB Drafts ({offlineDrafts.length})
          </button>
        </div>
      </div>

      {/* SECTION 1: Audit Trail */}
      {activeSection === 'audit' && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Immutable System Audit Log ({auditLogs.length} events)
            </h3>
            <span className="text-[11px] text-stone-500">Compliance & Security Trail</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 uppercase text-[10px] font-semibold">
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Action Event</th>
                  <th className="py-2.5 px-4">Actor</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Target Entity</th>
                  <th className="py-2.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50">
                    <td className="py-2.5 px-4 text-stone-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-stone-900 font-sans">
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-stone-800">{log.actorName}</td>
                    <td className="py-2.5 px-4 font-sans text-stone-600">{log.actorRole}</td>
                    <td className="py-2.5 px-4 text-emerald-800 font-semibold">{log.targetEntity}</td>
                    <td className="py-2.5 px-4 font-sans text-stone-600 max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: Architecture & Next Steps */}
      {activeSection === 'architecture' && (
        <div className="space-y-6">
          {/* Project Structure Overview */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-700" />
              <span>Project Structure & Modular Separation</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">1. Data Models</span>
                <p className="text-stone-600 text-[11px]">
                  <code>/src/types/index.ts</code>: Full TypeScript definitions for Farmers, FarmPlots, FieldMonitoringLogs, WarehouseTransactions, and Roles.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">2. Reusable UI Components</span>
                <p className="text-stone-600 text-[11px]">
                  <code>SpreadsheetTable.tsx</code>, <code>PWAInstallButton.tsx</code>, <code>OfflineBanner.tsx</code>: Standardized enterprise SaaS tables and controls.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">3. Business Logic Engines</span>
                <p className="text-stone-600 text-[11px]">
                  <code>inventoryLedger.ts</code>: Pure deterministic calculation of stock balances from immutable transaction history with zero manual edits.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 block">4. Offline Storage</span>
                <p className="text-stone-600 text-[11px]">
                  <code>offlineStorage.ts</code>: Native IndexedDB database wrappers with stores for drafts, cached registry, and offline queues.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps for Connecting Database & Cloud Operation */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm font-bold text-stone-900">
                Next Steps for Connecting Database & Reliable Cloud Operation
              </h3>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">
                    Database Access Rules & Intermediate Blueprint (Ready)
                  </h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    <code>firebase-blueprint.json</code> and <code>firestore.rules</code> are fully generated adhering to the Eight Pillars of Hardened Rules. Role checking functions (<code>isAdmin()</code>, <code>isFieldSupervisor()</code>, <code>isWarehouseOfficer()</code>) guard every write path.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-stone-200 bg-stone-50 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">
                    Connecting Real Firebase Authentication & Cloud Firestore
                  </h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    When provisioned via Firebase setup RPC, wire <code>initializeApp(firebaseConfig)</code> in <code>src/services/firebase.ts</code> and replace the local state in-memory seed with reactive Firestore listeners (<code>onSnapshot</code>) wrapped in error handlers.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-stone-200 bg-stone-50 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">
                    Reliable Two-Way Offline Sync Engine
                  </h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    Field registrations and monitoring records saved to IndexedDB <code>offlineStorage</code> are tagged with <code>local_draft</code>. Upon network reconnection, a background sync worker uploads drafts with write-ahead timestamp comparison and resolution.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-stone-200 bg-stone-50 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">
                    Object Storage for Geotagged Field Photos
                  </h4>
                  <p className="text-stone-600 text-[11px] mt-0.5">
                    Upload camera captures to Firebase Storage buckets under partitioned paths <code>/farmers/[farmerId]/kyc.jpg</code> and <code>/monitoring/[logId]/symptom.jpg</code> with client-side image compression to save mobile data bandwidth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: IndexedDB Drafts Inspector */}
      {activeSection === 'offline_db' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-700" />
              <h3 className="text-sm font-bold text-stone-900">
                IndexedDB Local Drafts Inspector (Database: <code>glean_agro_operations_db</code>)
              </h3>
            </div>

            {offlineDrafts.length > 0 && (
              <button
                onClick={onClearDrafts}
                className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold"
              >
                Clear All Drafts
              </button>
            )}
          </div>

          {offlineDrafts.length === 0 ? (
            <div className="p-8 border border-dashed border-stone-200 rounded-xl text-center text-stone-500 text-xs">
              No offline drafts currently queued in IndexedDB. All registrations and inspections are synchronized.
            </div>
          ) : (
            <div className="space-y-3">
              {offlineDrafts.map((d) => (
                <div
                  key={d.id}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-stone-900">{d.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {d.type.toUpperCase()} DRAFT
                      </span>
                    </div>
                    <p className="text-stone-600 text-[11px]">
                      Created: {new Date(d.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
