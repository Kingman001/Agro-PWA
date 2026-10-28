import React from 'react';
import { WifiOff, HardDrive, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface OfflineBannerProps {
  draftsCount?: number;
  onSyncAll?: () => void;
  isSyncing?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  draftsCount = 0,
  onSyncAll,
  isSyncing = false,
}) => {
  const isOnline = useOnlineStatus();

  if (isOnline && draftsCount === 0) {
    return null;
  }

  return (
    <div
      className={`px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b transition-colors ${
        !isOnline
          ? 'bg-amber-600 text-white border-amber-700'
          : 'bg-emerald-50 text-emerald-900 border-emerald-200'
      }`}
    >
      <div className="flex items-center gap-2 font-medium">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>
              <strong>Field Offline Mode:</strong> Network disconnected. Local forms will be securely saved to IndexedDB drafts.
            </span>
          </>
        ) : (
          <>
            <HardDrive className="w-4 h-4 text-emerald-700" />
            <span>
              <strong>IndexedDB Storage:</strong> {draftsCount} local draft(s) awaiting server synchronization.
            </span>
          </>
        )}
      </div>

      {draftsCount > 0 && isOnline && onSyncAll && (
        <button
          onClick={onSyncAll}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded font-medium shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : `Sync ${draftsCount} Draft(s) Now`}</span>
        </button>
      )}
    </div>
  );
};
