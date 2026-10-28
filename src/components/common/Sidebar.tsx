import React from 'react';
import {
  LayoutDashboard,
  Users,
  MapPin,
  ClipboardCheck,
  Warehouse,
  BarChart3,
  ShieldCheck,
  History,
  Lock,
  ChevronRight,
  Database,
} from 'lucide-react';
import { UserRole } from '../../types';

export type AppModuleId =
  | 'dashboard'
  | 'registry'
  | 'mapping'
  | 'monitoring'
  | 'warehouse'
  | 'reports'
  | 'users'
  | 'settings';

interface SidebarProps {
  currentModule: AppModuleId;
  onSelectModule: (module: AppModuleId) => void;
  activeRole: UserRole;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingDraftsCount: number;
}

interface NavItemConfig {
  id: AppModuleId;
  label: string;
  icon: React.ElementType;
  description: string;
  allowedRoles: UserRole[];
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Operations Dashboard',
    icon: LayoutDashboard,
    description: 'KPI summary, field metrics & alerts',
    allowedRoles: [
      'Administrator',
      'Field Officer',
      'Field Supervisor',
      'Registration Officer',
      'Warehouse Officer',
      'Management Viewer',
    ],
  },
  {
    id: 'registry',
    label: 'Farmer Registry',
    icon: Users,
    description: 'KYC, cooperatives & bio profiles',
    allowedRoles: [
      'Administrator',
      'Field Officer',
      'Field Supervisor',
      'Registration Officer',
      'Management Viewer',
    ],
  },
  {
    id: 'mapping',
    label: 'Farm Profiles & Maps',
    icon: MapPin,
    description: 'GIS boundaries & GPS polygons',
    allowedRoles: [
      'Administrator',
      'Field Officer',
      'Field Supervisor',
      'Registration Officer',
      'Management Viewer',
    ],
  },
  {
    id: 'monitoring',
    label: 'Field Monitoring',
    icon: ClipboardCheck,
    description: 'Agronomic visits, pests & scouts',
    allowedRoles: [
      'Administrator',
      'Field Officer',
      'Field Supervisor',
      'Management Viewer',
    ],
  },
  {
    id: 'warehouse',
    label: 'Warehouse & Inventory',
    icon: Warehouse,
    description: 'Traceable inputs & produce ledger',
    allowedRoles: [
      'Administrator',
      'Warehouse Officer',
      'Field Supervisor',
      'Management Viewer',
    ],
  },
  {
    id: 'reports',
    label: 'Analytics & Reports',
    icon: BarChart3,
    description: 'Yield forecasting & aggregations',
    allowedRoles: [
      'Administrator',
      'Field Supervisor',
      'Warehouse Officer',
      'Management Viewer',
      'Field Officer',
    ],
  },
  {
    id: 'users',
    label: 'User Management',
    icon: ShieldCheck,
    description: 'Staff roles, stations & credentials',
    allowedRoles: ['Administrator'],
  },
  {
    id: 'settings',
    label: 'Audit & System Config',
    icon: History,
    description: 'Immutable logs & architecture',
    allowedRoles: ['Administrator', 'Field Supervisor', 'Management Viewer'],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  activeRole,
  isOpenMobile,
  onCloseMobile,
  pendingDraftsCount,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 md:w-72 bg-white border-r border-stone-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-stone-600 uppercase flex items-center justify-between">
            <span>Modules</span>
            <span className="text-[10px] lowercase font-normal text-stone-600">
              Role: {activeRole.split(' ')[0]}
            </span>
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isAllowed = item.allowedRoles.includes(activeRole);
            const isSelected = currentModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isAllowed) {
                    onSelectModule(item.id);
                    onCloseMobile();
                  }
                }}
                disabled={!isAllowed}
                className={`w-full text-left rounded-lg p-2.5 transition flex items-center justify-between text-xs group ${
                  isSelected
                    ? 'bg-emerald-800 text-white font-medium shadow-xs'
                    : isAllowed
                    ? 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                    : 'text-stone-400 opacity-60 cursor-not-allowed bg-stone-50'
                }`}
                title={
                  !isAllowed
                    ? `Restricted: requires ${item.allowedRoles.join(' or ')} permission.`
                    : item.description
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-md ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : isAllowed
                        ? 'bg-stone-100 text-stone-600 group-hover:bg-stone-200 group-hover:text-stone-900'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="truncate flex items-center gap-1.5 font-semibold">
                      <span>{item.label}</span>
                      {item.id === 'monitoring' && pendingDraftsCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>
                    <div
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-emerald-100' : 'text-stone-600'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>

                <div>
                  {!isAllowed ? (
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                  ) : isSelected ? (
                    <ChevronRight className="w-4 h-4 text-emerald-100" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info box */}
        <div className="p-3 border-t border-stone-200 bg-stone-50/80">
          <div className="rounded-lg border border-stone-200 bg-white p-2.5 text-[11px] text-stone-600 space-y-1.5">
            <div className="flex items-center justify-between text-stone-800 font-semibold">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                Data & Offline Status
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                IndexedDB Ready
              </span>
            </div>
            <p className="text-[10px] text-stone-600 leading-tight">
              Cloud sync ready with Firestore rules blueprint. Offline drafts stored locally.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
