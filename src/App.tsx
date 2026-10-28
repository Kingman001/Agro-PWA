/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  UserRole,
  UserProfile,
  Farmer,
  FarmPlot,
  FieldMonitoringLog,
  WarehouseItem,
  WarehouseTransaction,
  AuditLogEntry,
  OfflineDraft,
} from './types';
import {
  SAMPLE_USERS,
  INITIAL_FARMERS,
  INITIAL_PLOTS,
  INITIAL_MONITORING_LOGS,
  INITIAL_WAREHOUSE_ITEMS,
  INITIAL_WAREHOUSE_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
} from './services/sampleData';
import { calculateItemBalances } from './services/inventoryLedger';
import { offlineStorage } from './services/offlineStorage';
import { auth, logoutUser, syncUserProfile } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { LoginScreen } from './components/auth/LoginScreen';
import { Header } from './components/common/Header';
import { Sidebar, AppModuleId } from './components/common/Sidebar';
import { OfflineBanner } from './components/common/OfflineBanner';

import { DashboardModule } from './components/dashboard/DashboardModule';
import { FarmerRegistryModule } from './components/registry/FarmerRegistryModule';
import { FarmerRegistrationWizard } from './components/registry/FarmerRegistrationWizard';
import { FarmMapsModule } from './components/mapping/FarmMapsModule';
import { FieldMonitoringModule } from './components/monitoring/FieldMonitoringModule';
import { MonitoringFormModal } from './components/monitoring/MonitoringFormModal';
import { WarehouseModule } from './components/warehouse/WarehouseModule';
import { NewTransactionModal } from './components/warehouse/NewTransactionModal';
import { ReportsModule } from './components/reports/ReportsModule';
import { UserManagementModule } from './components/users/UserManagementModule';
import { SettingsAuditModule } from './components/settings/SettingsAuditModule';
import { Sprout } from 'lucide-react';

export default function App() {
  // Authentication State
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('glean_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Navigation & Role State
  const [currentModule, setCurrentModule] = useState<AppModuleId>('dashboard');
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(SAMPLE_USERS);
  const [activeRole, setActiveRole] = useState<UserRole>(
    authenticatedUser?.role || 'Administrator'
  );
  const [currentUser, setCurrentUser] = useState<UserProfile>(
    authenticatedUser || SAMPLE_USERS[0]
  );
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  // Core Agricultural Operational Data
  const [farmers, setFarmers] = useState<Farmer[]>(INITIAL_FARMERS);
  const [plots, setPlots] = useState<FarmPlot[]>(INITIAL_PLOTS);
  const [monitoringLogs, setMonitoringLogs] = useState<FieldMonitoringLog[]>(INITIAL_MONITORING_LOGS);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>(INITIAL_WAREHOUSE_ITEMS);
  const [transactions, setTransactions] = useState<WarehouseTransaction[]>(INITIAL_WAREHOUSE_TRANSACTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Offline drafts in IndexedDB
  const [offlineDrafts, setOfflineDrafts] = useState<OfflineDraft[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Global Quick Modals
  const [isRegisterWizardOpen, setIsRegisterWizardOpen] = useState(false);
  const [isMonitoringModalOpen, setIsMonitoringModalOpen] = useState(false);
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          setAuthenticatedUser(profile);
          setCurrentUser(profile);
          setActiveRole(profile.role);
          localStorage.setItem('glean_auth_user', JSON.stringify(profile));

          // Ensure profile is in available users list
          setAvailableUsers((prev) => {
            if (!prev.some((u) => u.uid === profile.uid)) {
              return [profile, ...prev];
            }
            return prev;
          });
        } catch (err) {
          console.warn('Could not sync user profile from Firestore:', err);
        }
      } else {
        const stored = localStorage.getItem('glean_auth_user');
        if (stored) {
          try {
            const profile = JSON.parse(stored);
            setAuthenticatedUser(profile);
            setCurrentUser(profile);
            setActiveRole(profile.role);
          } catch {
            setAuthenticatedUser(null);
          }
        } else {
          setAuthenticatedUser(null);
        }
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Synchronize persona when role changes
  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    const matchedUser = availableUsers.find((u) => u.role === newRole);
    if (matchedUser) {
      setCurrentUser(matchedUser);
    }
  };

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveRole(user.role);
  };

  // Strictly compute warehouse stock balances from transaction ledger
  const warehouseBalances = useMemo(() => {
    return calculateItemBalances(warehouseItems, transactions);
  }, [warehouseItems, transactions]);

  // Load IndexedDB drafts on mount
  useEffect(() => {
    async function loadDrafts() {
      try {
        const drafts = await offlineStorage.getAllDrafts();
        setOfflineDrafts(drafts);
      } catch (err) {
        console.warn('Could not read IndexedDB drafts:', err);
      }
    }
    loadDrafts();
  }, []);

  // Helper to record audit log
  const logAuditEvent = (action: string, targetEntity: string, targetId: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorUid: currentUser.uid,
      actorName: currentUser.displayName,
      actorRole: activeRole,
      action,
      targetEntity,
      targetId,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // --- Auth Handlers ---
  const handleLoginSuccess = (profile: UserProfile) => {
    setAuthenticatedUser(profile);
    setCurrentUser(profile);
    setActiveRole(profile.role);
    localStorage.setItem('glean_auth_user', JSON.stringify(profile));

    setAvailableUsers((prev) => {
      if (!prev.some((u) => u.uid === profile.uid)) {
        return [profile, ...prev];
      }
      return prev;
    });

    logAuditEvent('USER_LOGIN_SUCCESS', 'Auth', profile.uid, `User signed in with role ${profile.role}`);
  };

  const handleSignOut = async () => {
    logAuditEvent('USER_SIGN_OUT', 'Auth', currentUser.uid, 'User initiated sign out');
    try {
      await logoutUser();
    } catch {
      // Ignore if offline
    }
    localStorage.removeItem('glean_auth_user');
    setAuthenticatedUser(null);
  };

  // --- Operational Handlers ---
  const handleAddFarmer = async (farmer: Farmer, isDraft: boolean) => {
    setFarmers((prev) => [farmer, ...prev]);

    if (isDraft) {
      const drafts = await offlineStorage.getAllDrafts();
      setOfflineDrafts(drafts);
    }

    logAuditEvent(
      isDraft ? 'FARMER_SAVED_LOCAL_DRAFT' : 'FARMER_ENROLLED_REGISTRY',
      'Farmer',
      farmer.id,
      `Registered ${farmer.fullName} (${farmer.registrationNumber}) in ${farmer.district}`
    );
  };

  const handleUpdateFarmerStatus = (farmerId: string, newStatus: Farmer['status']) => {
    setFarmers((prev) =>
      prev.map((f) => (f.id === farmerId ? { ...f, status: newStatus, updatedAt: new Date().toISOString() } : f))
    );
    logAuditEvent('FARMER_STATUS_UPDATED', 'Farmer', farmerId, `Changed status to ${newStatus}`);
  };

  const handleAddMonitoringLog = async (log: FieldMonitoringLog, isDraft: boolean) => {
    setMonitoringLogs((prev) => [log, ...prev]);

    if (isDraft) {
      const drafts = await offlineStorage.getAllDrafts();
      setOfflineDrafts(drafts);
    }

    logAuditEvent(
      isDraft ? 'INSPECTION_SAVED_LOCAL_DRAFT' : 'INSPECTION_LOGGED',
      'FieldMonitoringLog',
      log.id,
      `Inspected plot ${log.plotCode} (Pest Severity: ${log.pestSeverity})`
    );
  };

  const handleUpdateLogStatus = (logId: string, status: FieldMonitoringLog['status']) => {
    setMonitoringLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? {
              ...l,
              status,
              reviewedBy: currentUser.displayName,
              reviewedAt: new Date().toISOString(),
            }
          : l
      )
    );
    logAuditEvent('INSPECTION_REVIEWED', 'FieldMonitoringLog', logId, `Updated status to ${status}`);
  };

  const handleRecordTransaction = (tx: WarehouseTransaction) => {
    setTransactions((prev) => [tx, ...prev]);
    logAuditEvent(
      'STOCK_LEDGER_TRANSACTION_RECORDED',
      'WarehouseTransaction',
      tx.id,
      `${tx.transactionType} of ${tx.quantity} ${tx.unitOfMeasure} for ${tx.itemName} (${tx.referenceDoc})`
    );
  };

  const handleSyncAllDrafts = async () => {
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setFarmers((prev) =>
      prev.map((f) => (f.syncStatus === 'local_draft' ? { ...f, syncStatus: 'synced' } : f))
    );
    setMonitoringLogs((prev) =>
      prev.map((m) => (m.syncStatus === 'local_draft' ? { ...m, syncStatus: 'synced' } : m))
    );

    for (const d of offlineDrafts) {
      await offlineStorage.deleteDraft(d.id);
    }
    setOfflineDrafts([]);
    setIsSyncing(false);

    logAuditEvent('OFFLINE_DRAFTS_SYNCHRONIZED', 'System', 'IndexedDB', 'Synchronized pending local drafts to registry');
  };

  const handleClearDrafts = async () => {
    for (const d of offlineDrafts) {
      await offlineStorage.deleteDraft(d.id);
    }
    setOfflineDrafts([]);
  };

  // CSV Import handlers
  const handleImportFarmers = (importedRows: Record<string, string>[]) => {
    const imported: Farmer[] = importedRows.map((r, i) => ({
      id: `frm-imp-${Date.now()}-${i}`,
      registrationNumber: r.registrationNumber || r.RegistrationNumber || `GA-WR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: r.fullName || r.FarmerName || r['Farmer Full Name'] || 'Unknown Farmer',
      nationalId: r.nationalId || r.NationalId || 'N/A',
      phone: r.phone || r.Phone || 'N/A',
      gender: (r.gender as any) || 'Male',
      dateOfBirth: r.dateOfBirth || '1985-01-01',
      community: r.community || 'N/A',
      district: r.district || 'Ashanti Central',
      cooperative: r.cooperative || 'Golden Pod Cocoa Growers',
      primaryCrop: r.primaryCrop || 'Cocoa',
      farmSizeEstimateHa: parseFloat(r.farmSizeEstimateHa || r['Land (Ha)']) || 2.5,
      status: 'Active',
      registeredBy: currentUser.uid,
      registeredByName: currentUser.displayName,
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced',
    }));

    setFarmers((prev) => [...imported, ...prev]);
    logAuditEvent('FARMER_REGISTRY_CSV_IMPORTED', 'Farmer', 'Bulk', `Imported ${imported.length} smallholders via CSV`);
  };

  const handleImportMonitoringLogs = (rows: Record<string, string>[]) => {
    logAuditEvent('MONITORING_LOGS_CSV_IMPORTED', 'FieldMonitoringLog', 'Bulk', `Parsed ${rows.length} CSV survey logs`);
  };

  const handleImportTransactions = (rows: Record<string, string>[]) => {
    logAuditEvent('STOCK_LEDGER_CSV_IMPORTED', 'WarehouseTransaction', 'Bulk', `Parsed ${rows.length} CSV ledger rows`);
  };

  // 1. Initial Checking Loader
  if (authChecking) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white animate-pulse">
          <Sprout className="w-6 h-6 text-emerald-100" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold tracking-tight">Glean Agro Operations</h2>
          <p className="text-xs text-stone-400">Verifying session credentials & security keys...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Gate: Users MUST log in before using app
  if (!authenticatedUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Authenticated App Experience
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900 font-sans selection:bg-emerald-200">
      {/* Top Application Header with Sign Out Button */}
      <Header
        currentUser={currentUser}
        availableUsers={availableUsers}
        onSelectUser={handleSelectUser}
        onToggleSidebar={() => setIsSidebarMobileOpen((prev) => !prev)}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        onSignOut={handleSignOut}
      />

      {/* Offline Connectivity & Draft Alert Banner */}
      <OfflineBanner
        draftsCount={offlineDrafts.length}
        onSyncAll={handleSyncAllDrafts}
        isSyncing={isSyncing}
      />

      {/* Main Responsive Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentModule={currentModule}
          onSelectModule={(mod) => setCurrentModule(mod)}
          activeRole={activeRole}
          isOpenMobile={isSidebarMobileOpen}
          onCloseMobile={() => setIsSidebarMobileOpen(false)}
          pendingDraftsCount={offlineDrafts.length}
        />

        {/* Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentModule === 'dashboard' && (
              <DashboardModule
                farmers={farmers}
                plots={plots}
                monitoringLogs={monitoringLogs}
                warehouseBalances={warehouseBalances}
                transactions={transactions}
                activeRole={activeRole}
                onNavigate={(mod) => setCurrentModule(mod)}
                onOpenRegisterFarmer={() => setIsRegisterWizardOpen(true)}
                onOpenNewMonitoring={() => setIsMonitoringModalOpen(true)}
                onOpenNewTransaction={() => setIsNewTxModalOpen(true)}
              />
            )}

            {currentModule === 'registry' && (
              <FarmerRegistryModule
                farmers={farmers}
                plots={plots}
                monitoringLogs={monitoringLogs}
                onAddFarmer={handleAddFarmer}
                onUpdateFarmerStatus={handleUpdateFarmerStatus}
                onImportFarmers={handleImportFarmers}
                activeRole={activeRole}
                currentUserId={currentUser.uid}
                currentUserName={currentUser.displayName}
              />
            )}

            {currentModule === 'mapping' && (
              <FarmMapsModule plots={plots} activeRole={activeRole} />
            )}

            {currentModule === 'monitoring' && (
              <FieldMonitoringModule
                logs={monitoringLogs}
                plots={plots}
                onAddLog={handleAddMonitoringLog}
                onUpdateLogStatus={handleUpdateLogStatus}
                onImportLogs={handleImportMonitoringLogs}
                activeRole={activeRole}
                currentUserId={currentUser.uid}
                currentUserName={currentUser.displayName}
              />
            )}

            {currentModule === 'warehouse' && (
              <WarehouseModule
                items={warehouseItems}
                transactions={transactions}
                balances={warehouseBalances}
                onRecordTransaction={handleRecordTransaction}
                onImportTransactions={handleImportTransactions}
                activeRole={activeRole}
                currentUserId={currentUser.uid}
                currentUserName={currentUser.displayName}
              />
            )}

            {currentModule === 'reports' && (
              <ReportsModule
                farmers={farmers}
                plots={plots}
                monitoringLogs={monitoringLogs}
                balances={warehouseBalances}
                activeRole={activeRole}
              />
            )}

            {currentModule === 'users' && (
              <UserManagementModule
                users={availableUsers}
                onAddUser={(u) => setAvailableUsers((prev) => [...prev, u])}
                activeRole={activeRole}
              />
            )}

            {currentModule === 'settings' && (
              <SettingsAuditModule
                auditLogs={auditLogs}
                offlineDrafts={offlineDrafts}
                onClearDrafts={handleClearDrafts}
                activeRole={activeRole}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Quick Action Modals */}
      {isRegisterWizardOpen && (
        <FarmerRegistrationWizard
          onClose={() => setIsRegisterWizardOpen(false)}
          onSaveFarmer={handleAddFarmer}
          activeRole={activeRole}
          currentUserId={currentUser.uid}
          currentUserName={currentUser.displayName}
        />
      )}

      {isMonitoringModalOpen && (
        <MonitoringFormModal
          plots={plots}
          onClose={() => setIsMonitoringModalOpen(false)}
          onSubmitLog={handleAddMonitoringLog}
          activeRole={activeRole}
          currentUserId={currentUser.uid}
          currentUserName={currentUser.displayName}
        />
      )}

      {isNewTxModalOpen && (
        <NewTransactionModal
          items={warehouseItems}
          balances={warehouseBalances}
          onClose={() => setIsNewTxModalOpen(false)}
          onRecordTransaction={handleRecordTransaction}
          activeRole={activeRole}
          currentUserId={currentUser.uid}
          currentUserName={currentUser.displayName}
        />
      )}
    </div>
  );
}
