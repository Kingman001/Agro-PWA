import React, { useState, useMemo } from 'react';
import { PlusCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { Farmer, FarmPlot, FieldMonitoringLog, UserRole } from '../../types';
import { SpreadsheetTable, ColumnDef, SavedView } from '../common/SpreadsheetTable';
import { FarmerDetailModal } from './FarmerDetailModal';
import { FarmerRegistrationWizard } from './FarmerRegistrationWizard';

interface RegistryProps {
  farmers: Farmer[];
  plots: FarmPlot[];
  monitoringLogs: FieldMonitoringLog[];
  onAddFarmer: (farmer: Farmer, isDraft: boolean) => void;
  onUpdateFarmerStatus: (farmerId: string, newStatus: Farmer['status']) => void;
  onImportFarmers: (rows: Record<string, string>[]) => void;
  activeRole: UserRole;
  currentUserId: string;
  currentUserName: string;
}

export const FarmerRegistryModule: React.FC<RegistryProps> = ({
  farmers,
  plots,
  monitoringLogs,
  onAddFarmer,
  onUpdateFarmerStatus,
  onImportFarmers,
  activeRole,
  currentUserId,
  currentUserName,
}) => {
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [activeViewId, setActiveViewId] = useState('all');

  const canRegister = ['Administrator', 'Registration Officer', 'Field Officer'].includes(activeRole);
  const canModifyStatus = ['Administrator', 'Field Supervisor'].includes(activeRole);

  // Extract unique filter options
  const districtOptions = useMemo(
    () => Array.from(new Set(farmers.map((f) => f.district))),
    [farmers]
  );
  const cooperativeOptions = useMemo(
    () => Array.from(new Set(farmers.map((f) => f.cooperative))),
    [farmers]
  );
  const cropOptions = useMemo(
    () => Array.from(new Set(farmers.map((f) => f.primaryCrop))),
    [farmers]
  );

  const savedViews: SavedView<Farmer>[] = [
    {
      id: 'all',
      label: 'All Farmers',
      predicate: () => true,
      badgeCount: farmers.length,
    },
    {
      id: 'active',
      label: 'Active & Verified',
      predicate: (f) => f.status === 'Active',
      badgeCount: farmers.filter((f) => f.status === 'Active').length,
    },
    {
      id: 'pending',
      label: 'Pending Verification',
      predicate: (f) => f.status === 'Pending Verification',
      badgeCount: farmers.filter((f) => f.status === 'Pending Verification').length,
    },
    {
      id: 'cocoa',
      label: 'Cocoa Growers',
      predicate: (f) => f.primaryCrop === 'Cocoa',
      badgeCount: farmers.filter((f) => f.primaryCrop === 'Cocoa').length,
    },
    {
      id: 'grains',
      label: 'Grains & Legumes',
      predicate: (f) => ['Yellow Maize', 'Soybeans'].includes(f.primaryCrop),
      badgeCount: farmers.filter((f) => ['Yellow Maize', 'Soybeans'].includes(f.primaryCrop)).length,
    },
  ];

  const columns: ColumnDef<Farmer>[] = [
    {
      key: 'registrationNumber',
      header: 'Reg No.',
      width: '130px',
      sortable: true,
      render: (f) => (
        <span className="font-mono font-bold text-stone-900 flex items-center gap-1">
          {f.registrationNumber}
          {f.syncStatus === 'local_draft' && (
            <span
              className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
              title="Local IndexedDB draft"
            />
          )}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Farmer Full Name',
      sortable: true,
      render: (f) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-800 text-emerald-100 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
            {f.photoUrl ? (
              <img src={f.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              f.fullName.charAt(0)
            )}
          </div>
          <div>
            <div className="font-semibold text-stone-900">{f.fullName}</div>
            <div className="text-[10px] text-stone-500 font-mono">{f.nationalId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact Phone',
      sortable: false,
      render: (f) => <span className="font-mono text-stone-700">{f.phone}</span>,
    },
    {
      key: 'district',
      header: 'District',
      sortable: true,
      filterable: true,
      filterOptions: districtOptions,
      render: (f) => (
        <div>
          <div className="text-stone-800 font-medium">{f.district}</div>
          <div className="text-[10px] text-stone-500">{f.community}</div>
        </div>
      ),
    },
    {
      key: 'cooperative',
      header: 'Cooperative',
      sortable: true,
      filterable: true,
      filterOptions: cooperativeOptions,
      render: (f) => <span className="text-stone-700 font-medium">{f.cooperative}</span>,
    },
    {
      key: 'primaryCrop',
      header: 'Primary Crop',
      sortable: true,
      filterable: true,
      filterOptions: cropOptions,
      render: (f) => (
        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-medium text-[11px]">
          {f.primaryCrop}
        </span>
      ),
    },
    {
      key: 'farmSizeEstimateHa',
      header: 'Land (Ha)',
      sortable: true,
      align: 'right',
      render: (f) => (
        <span className="font-mono font-bold text-stone-800">
          {Number(f.farmSizeEstimateHa).toFixed(1)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Active', 'Pending Verification', 'Suspended'],
      render: (f) => {
        if (canModifyStatus) {
          return (
            <select
              value={f.status}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onUpdateFarmerStatus(f.id, e.target.value as any)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer ${
                f.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}
            >
              <option value="Active">Active</option>
              <option value="Pending Verification">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          );
        }

        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
              f.status === 'Active'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {f.status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'View',
      sortable: false,
      align: 'center',
      render: (f) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFarmer(f);
          }}
          className="p-1 rounded text-stone-500 hover:text-emerald-700 hover:bg-stone-100 transition"
          title="Open farmer dossier"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SpreadsheetTable<Farmer>
        title="Farmer Registry Master Tracker"
        subtitle="Smallholder profiling, national identity KYC verification and cooperative registry"
        data={farmers}
        columns={columns}
        keyExtractor={(f) => f.id}
        savedViews={savedViews}
        activeSavedViewId={activeViewId}
        onSelectSavedView={setActiveViewId}
        onRowClick={(f) => setSelectedFarmer(f)}
        exportFilename="glean-agro-farmer-registry"
        onImportData={onImportFarmers}
        actionButton={
          canRegister ? (
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Enroll Farmer</span>
            </button>
          ) : undefined
        }
      />

      {/* Farmer Detail Dossier Modal */}
      {selectedFarmer && (
        <FarmerDetailModal
          farmer={selectedFarmer}
          plots={plots}
          monitoringLogs={monitoringLogs}
          onClose={() => setSelectedFarmer(null)}
          onUpdateStatus={onUpdateFarmerStatus}
          activeRole={activeRole}
        />
      )}

      {/* Registration Wizard Modal */}
      {showWizard && (
        <FarmerRegistrationWizard
          onClose={() => setShowWizard(false)}
          onSaveFarmer={onAddFarmer}
          activeRole={activeRole}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
        />
      )}
    </div>
  );
};
