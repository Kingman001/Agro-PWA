import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
        title="Install Glean Agro Operations PWA on your device for offline field use"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 px-2.5 py-1.5 text-xs font-medium transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="text-base font-bold text-stone-900">Install Glean Agro PWA</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 space-y-3 text-xs text-stone-700 leading-relaxed">
                <p>To run Glean Agro full-screen on your iPhone or iPad with offline storage:</p>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                  <p>1. Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.</p>
                  <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                  <p>3. Tap <strong>Add</strong> in the top right corner.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-emerald-700 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
