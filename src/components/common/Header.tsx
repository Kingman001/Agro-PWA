import React from 'react';
import { Menu, Wifi, WifiOff, Sprout, ShieldAlert, LogOut } from 'lucide-react';
import { UserRole, UserProfile } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface HeaderProps {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onToggleSidebar: () => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSignOut?: () => void;
}

const ALL_ROLES: UserRole[] = [
  'Administrator',
  'Field Officer',
  'Field Supervisor',
  'Registration Officer',
  'Warehouse Officer',
  'Management Viewer',
];

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  availableUsers,
  onSelectUser,
  onToggleSidebar,
  activeRole,
  onRoleChange,
  onSignOut,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 bg-stone-900 border-b border-stone-800 text-stone-100 shadow-sm">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Sprout className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white sm:text-base">
                  Glean Agro
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  Operations
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-stone-400">
                PWA Registry • Mapping • Field Monitoring • Warehouse Ledger
              </p>
            </div>
          </div>
        </div>

        {/* Right controls: Role Selector, Status & PWA Install */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-stone-800/90 border border-stone-700 rounded-lg px-2.5 py-1.5">
            <span className="hidden lg:inline text-[11px] font-medium text-stone-400 uppercase tracking-wider">
              Role:
            </span>
            <select
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-xs font-semibold text-emerald-300 focus:outline-none cursor-pointer"
              title="Switch user role to test role-based permissions"
            >
              {ALL_ROLES.map((r) => (
                <option key={r} value={r} className="bg-stone-900 text-stone-200">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* User selector */}
          <div className="hidden xl:flex items-center gap-2 border-l border-stone-800 pl-3">
            <select
              value={currentUser.uid}
              onChange={(e) => {
                const u = availableUsers.find((usr) => usr.uid === e.target.value);
                if (u) onSelectUser(u);
              }}
              className="bg-stone-800/80 border border-stone-700 text-xs rounded-md px-2 py-1 text-stone-300 focus:outline-none"
              title="Select active staff persona"
            >
              {availableUsers.map((u) => (
                <option key={u.uid} value={u.uid} className="bg-stone-900 text-stone-200">
                  {u.displayName} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Online / Offline badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium border ${
              isOnline
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                : 'bg-amber-950/80 text-amber-300 border-amber-700/80'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Install Button */}
          <PWAInstallButton />

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-700 bg-stone-800/80 hover:bg-red-950/80 hover:border-red-800/80 hover:text-red-300 text-stone-300 text-xs font-semibold transition cursor-pointer"
              title="Sign out of Glean Agro Operations"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-400 group-hover:text-red-400" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Demo disclaimer bar */}
      <div className="bg-amber-500/10 border-t border-amber-500/20 px-4 py-1 text-[11px] text-amber-300 flex items-center justify-between">
        <div className="flex items-center gap-1.5 truncate">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">
            <strong>Fictional Demo Environment:</strong> Role-based access enforcement active for{' '}
            <span className="font-semibold underline decoration-amber-400">{activeRole}</span>. Database & local draft sync simulation enabled.
          </span>
        </div>
        <span className="hidden md:inline text-[10px] text-amber-400/80 font-mono">
          STATION: {currentUser.station}
        </span>
      </div>
    </header>
  );
};
