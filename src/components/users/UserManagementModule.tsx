import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Building,
  Key,
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';

interface UsersProps {
  users: UserProfile[];
  onAddUser: (user: UserProfile) => void;
  activeRole: UserRole;
}

const ROLE_PERMISSIONS: { role: UserRole; desc: string; caps: string[] }[] = [
  {
    role: 'Administrator',
    desc: 'Complete system privileges, user administration, security policy and schema governance.',
    caps: ['Manage Users', 'Approve/Suspend Farmers', 'Authorize Cycle Adjustments', 'Configure Settings', 'Deploy Rules'],
  },
  {
    role: 'Field Supervisor',
    desc: 'Supervises field officers, reviews agronomic inspections, approves farmer registrations, audits plots.',
    caps: ['Approve Farmer KYC', 'Review Inspection Logs', 'Flag Pest Outbreaks', 'Audit Farm Maps', 'View Warehouse'],
  },
  {
    role: 'Field Officer',
    desc: 'On-the-ground extension scout. Performs GPS polygon walks, pest scouting, and offline draft collection.',
    caps: ['Draft Farmer Enrollments', 'Log Field Inspections', 'Tag Geotags & Photos', 'Access Offline DB'],
  },
  {
    role: 'Registration Officer',
    desc: 'Focuses on smallholder outreach, farmer KYC documentation, biometric photos, and cooperative registry.',
    caps: ['Enroll Farmers', 'Upload National ID Photos', 'Record Cooperative Links', 'Export Registry CSV'],
  },
  {
    role: 'Warehouse Officer',
    desc: 'Authorizes input dispatches to farmers, logs crop intake from harvest aggregating, manages stock ledger.',
    caps: ['Record Receipts & Issues', 'Manage Produce Dispatches', 'Print Waybills', 'Track Batch Numbers'],
  },
  {
    role: 'Management Viewer',
    desc: 'Executive stakeholder and donor monitor. Read-only access to high-level dashboards and yield projections.',
    caps: ['View Operations Dashboard', 'Export Aggregated Reports', 'Monitor Inventory Balances', 'View Audit Trail'],
  },
];

export const UserManagementModule: React.FC<UsersProps> = ({ users, onAddUser, activeRole }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Field Officer');
  const [station, setStation] = useState('Regional Hub');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newUser: UserProfile = {
      uid: `usr_${Date.now()}`,
      displayName: name.trim(),
      email: email.trim(),
      role,
      station: station.trim(),
      active: true,
    };

    onAddUser(newUser);
    setShowAddModal(false);
    setName('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Staff Administration & Role-Based Access Control</span>
          </h2>
          <p className="text-xs text-stone-500">
            Enforcing least-privilege attribute-based security across all operational departments
          </p>
        </div>

        {activeRole === 'Administrator' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Provision Staff Persona</span>
          </button>
        )}
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Active System Personnel ({users.length})
          </h3>
          <span className="text-[11px] text-stone-500">Authenticated via Firebase Auth</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 uppercase text-[10px] font-semibold">
                <th className="py-2.5 px-4">Staff Member</th>
                <th className="py-2.5 px-4">Email Address</th>
                <th className="py-2.5 px-4">Security Role</th>
                <th className="py-2.5 px-4">Assigned Station / Hub</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-stone-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {user.displayName.charAt(0)}
                      </div>
                      <span className="font-semibold text-stone-900">{user.displayName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-stone-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-semibold text-[11px] border border-stone-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-700">{user.station}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Capabilities Reference Grid */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-stone-900">
            Role Permission Matrix & Capabilities
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLE_PERMISSIONS.map((rp) => (
            <div
              key={rp.role}
              className={`p-4 rounded-xl border transition ${
                activeRole === rp.role
                  ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-100'
                  : 'bg-stone-50/60 border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-xs">{rp.role}</span>
                {activeRole === rp.role && (
                  <span className="text-[10px] bg-emerald-700 text-white font-bold px-1.5 py-0.2 rounded">
                    Active
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-stone-600 leading-relaxed">{rp.desc}</p>
              <div className="mt-3 pt-2 border-t border-stone-200/80 flex flex-wrap gap-1">
                {rp.caps.map((cap) => (
                  <span
                    key={cap}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-stone-200 text-stone-700 font-medium"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="bg-stone-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Provision Staff Persona</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Full Staff Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Yaa Pokuaa"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="y.pokuaa@gleanagro.org"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {ROLE_PERMISSIONS.map((rp) => (
                    <option key={rp.role} value={rp.role}>
                      {rp.role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Station Hub</label>
                <input
                  type="text"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  placeholder="e.g. Western District Silos"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white font-bold"
                >
                  Save Persona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
