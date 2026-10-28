import React, { useState } from 'react';
import {
  Sprout,
  ShieldCheck,
  MapPin,
  Warehouse,
  ClipboardCheck,
  Users,
  Lock,
  ArrowRight,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import { UserRole, UserProfile } from '../../types';
import { signInWithGoogle } from '../../services/firebase';
import { SAMPLE_USERS } from '../../services/sampleData';

interface LoginScreenProps {
  onLoginSuccess: (userProfile: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const firebaseUser = await signInWithGoogle();
      // Derive profile
      const isAdmin = firebaseUser.email === 'Joshaku911@gmail.com';
      const profile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Staff Member',
        role: isAdmin ? 'Administrator' : 'Field Officer',
        station: isAdmin ? 'Headquarters & Processing Hub' : 'District Outreach Station',
        avatarUrl: firebaseUser.photoURL || undefined,
        active: true,
      };
      onLoginSuccess(profile);
    } catch (err: any) {
      console.warn('Sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in popup was closed before completion. Please try again.');
      } else {
        setErrorMessage(
          err.message || 'Unable to authenticate with Google. You may also select a staff persona below.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStaffPersona = (persona: UserProfile) => {
    onLoginSuccess(persona);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-between selection:bg-emerald-300 selection:text-emerald-950 relative overflow-hidden">
      {/* Background Subtle Furrow Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Top Brand Nav */}
      <header className="px-6 py-5 flex items-center justify-between relative z-10 border-b border-stone-800/80 bg-stone-950/40 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
            <Sprout className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">Glean Agro</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Operations
              </span>
            </div>
            <p className="text-[11px] text-stone-400">Agricultural Operations Management Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Protected Enterprise System</span>
        </div>
      </header>

      {/* Main Login Card Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-xl bg-stone-950/90 border border-stone-800 rounded-3xl shadow-2xl p-6 sm:p-10 space-y-8 backdrop-blur-md">
          {/* Header Copy */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign In to Access Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome to Glean Agro
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
              Please authenticate to access farmer registries, GIS plot boundaries, agronomic scout forms, and warehouse stock ledgers.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
              <span className="font-bold shrink-0">✕</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Action: Google Sign In */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-stone-100 disabled:opacity-60 text-stone-900 font-bold text-sm shadow-md transition flex items-center justify-center gap-3 cursor-pointer group"
            >
              {/* Google Multicolored Icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{loading ? 'Authenticating...' : 'Sign In with Google Account'}</span>
            </button>
          </div>

          {/* Quick Staff Persona Access */}
          <div className="space-y-3 pt-4 border-t border-stone-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Staff Role Personas (Quick Switch)
              </span>
              <span className="text-[10px] text-stone-400">Pre-configured stations</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_USERS.map((user) => (
                <button
                  key={user.uid}
                  onClick={() => handleSelectStaffPersona(user)}
                  className="p-2.5 rounded-xl border border-stone-800 bg-stone-900/60 hover:bg-stone-800/80 hover:border-emerald-600/60 transition text-left text-xs group flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold text-stone-200 group-hover:text-emerald-300 truncate">
                      {user.displayName}
                    </div>
                    <div className="text-[10px] text-stone-400">{user.role}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Security & Offline Footnote */}
          <div className="p-3.5 rounded-xl bg-stone-900/40 border border-stone-800 text-[11px] text-stone-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-stone-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline-First Progressive Web App</span>
            </div>
            <p className="leading-relaxed">
              Once authenticated, your session is cached locally on this device. Field officers can continue registering farmers and conducting plot surveys even when working off-grid.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-stone-800 text-center text-xs text-stone-400">
        &copy; {new Date().getFullYear()} Glean Agro Operations • Season 2026/27 • Cloud Firestore & Firebase Auth
      </footer>
    </div>
  );
};
