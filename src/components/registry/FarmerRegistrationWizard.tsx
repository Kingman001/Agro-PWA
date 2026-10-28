import React, { useState } from 'react';
import {
  X,
  Camera,
  MapPin,
  Check,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Farmer, UserRole } from '../../types';
import { useGeolocation } from '../../hooks/useGeolocation';
import { offlineStorage } from '../../services/offlineStorage';

interface WizardProps {
  onClose: () => void;
  onSaveFarmer: (farmer: Farmer, isDraft: boolean) => void;
  activeRole: UserRole;
  currentUserId: string;
  currentUserName: string;
}

export const FarmerRegistrationWizard: React.FC<WizardProps> = ({
  onClose,
  onSaveFarmer,
  activeRole,
  currentUserId,
  currentUserName,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const geo = useGeolocation();

  // Form State
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('1985-05-15');
  const [district, setDistrict] = useState('Ashanti Central');
  const [community, setCommunity] = useState('');
  const [cooperative, setCooperative] = useState('Golden Pod Cocoa Growers');
  const [primaryCrop, setPrimaryCrop] = useState('Cocoa');
  const [farmSize, setFarmSize] = useState<number>(3.5);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Photo capture handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    setValidationError(null);
    if (currentStep === 1) {
      if (!fullName.trim()) {
        setValidationError('Full farmer name is required.');
        return;
      }
      if (!phone.trim()) {
        setValidationError('Valid contact phone number is required.');
        return;
      }
      if (!nationalId.trim()) {
        setValidationError('National identification number (KYC) is required.');
        return;
      }
    } else if (currentStep === 2) {
      if (!community.trim()) {
        setValidationError('Community / Village name is required.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleComplete = async (isDraft: boolean) => {
    const regNumber = `GA-WR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFarmer: Farmer = {
      id: `frm-${Date.now()}`,
      registrationNumber: regNumber,
      fullName,
      nationalId,
      phone,
      gender,
      dateOfBirth: dob,
      district,
      community,
      cooperative,
      primaryCrop,
      farmSizeEstimateHa: Number(farmSize) || 1,
      status: isDraft ? 'Pending Verification' : 'Active',
      photoUrl: photoPreview || undefined,
      registeredBy: currentUserId,
      registeredByName: currentUserName,
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: isDraft ? 'local_draft' : 'synced',
      gpsCoordinates:
        geo.latitude && geo.longitude
          ? {
              latitude: geo.latitude,
              longitude: geo.longitude,
              accuracyMeters: geo.accuracy || 5,
            }
          : undefined,
    };

    if (isDraft) {
      await offlineStorage.saveDraft({
        id: newFarmer.id,
        type: 'farmer',
        data: newFarmer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    onSaveFarmer(newFarmer, isDraft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between border-b border-emerald-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 uppercase tracking-wider font-semibold font-mono">
                Field Wizard
              </span>
              <h2 className="text-base sm:text-lg font-bold">Farmer Registration</h2>
            </div>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Touch-optimized enrollment form with KYC verification & offline sync
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[
              { num: 1, label: 'Identity & Bio' },
              { num: 2, label: 'Farm & Co-op' },
              { num: 3, label: 'GPS Geofence' },
              { num: 4, label: 'Review & Save' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === s.num
                      ? 'bg-emerald-700 text-white ring-4 ring-emerald-100'
                      : currentStep > s.num
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`hidden sm:inline text-xs font-medium ${
                    currentStep === s.num ? 'text-stone-900 font-bold' : 'text-stone-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Step Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* STEP 1: Personal & Bio Data */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kofi Manu Gyasi"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    National ID Number (Ghana Card / Voter ID) *
                  </label>
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="e.g. GHA-718293041-9"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Primary Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 24 000 0000"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Capture */}
              <div className="pt-2 border-t border-stone-200">
                <label className="block text-stone-700 font-semibold mb-1.5">
                  Farmer Facial Photo / Camera Capture
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Captured farmer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-6 h-6 text-stone-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Photo / Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Supports direct mobile rear camera capture for biometric identity records.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Farm & Cooperative Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Administrative District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Ashanti Central">Ashanti Central</option>
                    <option value="Ashanti South">Ashanti South</option>
                    <option value="Ejura Sekyedumase">Ejura Sekyedumase</option>
                    <option value="Ejisu Juaben">Ejisu Juaben</option>
                    <option value="Sekyere West">Sekyere West</option>
                    <option value="Sekyere Afram Plains">Sekyere Afram Plains</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Community / Village *
                  </label>
                  <input
                    type="text"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    placeholder="e.g. Adansi Asokwa"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Cooperative Affiliation
                  </label>
                  <select
                    value={cooperative}
                    onChange={(e) => setCooperative(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Golden Pod Cocoa Growers">Golden Pod Cocoa Growers</option>
                    <option value="Sunrise Organic Grains">Sunrise Organic Grains</option>
                    <option value="Savanna Legume Producers">Savanna Legume Producers</option>
                    <option value="Bono Green Valley Co-op">Bono Green Valley Co-op</option>
                    <option value="Independent (No Cooperative)">Independent (No Cooperative)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Primary Crop Type
                  </label>
                  <select
                    value={primaryCrop}
                    onChange={(e) => setPrimaryCrop(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Cocoa">Cocoa (Theobroma cacao)</option>
                    <option value="Yellow Maize">Yellow Maize (Zea mays)</option>
                    <option value="Soybeans">Soybeans (Glycine max)</option>
                    <option value="Cassava">Cassava (Manihot esculenta)</option>
                    <option value="Coffee">Coffee (Coffea canephora)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Estimated Farm Land Area (Hectares)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={farmSize}
                    onChange={(e) => setFarmSize(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: GPS Geofence & Location Capture */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>Field GPS Stamp</span>
                  </div>
                  {geo.accuracy && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono">
                      Accuracy: &plusmn;{geo.accuracy}m
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-stone-600">
                  Acquire accurate GPS satellite coordinates directly on the farmer's homestead or main plot gate for anti-fraud traceability.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={geo.captureGPS}
                    disabled={geo.loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white rounded-lg font-semibold"
                  >
                    <MapPin className={`w-4 h-4 ${geo.loading ? 'animate-bounce' : ''}`} />
                    <span>{geo.loading ? 'Acquiring GPS Fix...' : 'Capture Current Location'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => geo.setManualCoordinates(6.4528, -1.5849, 4.0)}
                    className="text-[11px] text-emerald-800 hover:underline"
                  >
                    (Simulate Field Fix)
                  </button>
                </div>

                {geo.latitude && geo.longitude && (
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-stone-500 block text-[10px]">LATITUDE</span>
                      <span className="font-bold text-stone-900">{geo.latitude}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px]">LONGITUDE</span>
                      <span className="font-bold text-stone-900">{geo.longitude}</span>
                    </div>
                  </div>
                )}

                {geo.error && (
                  <p className="text-[11px] text-amber-700 italic">{geo.error}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <h3 className="font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Dossier Verification Summary</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500 block text-[11px]">Farmer Name</span>
                    <span className="font-bold text-stone-900">{fullName}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px]">National ID</span>
                    <span className="font-bold text-stone-900">{nationalId}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px]">Phone Contact</span>
                    <span className="font-bold text-stone-900">{phone}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px]">Location</span>
                    <span className="font-bold text-stone-900">
                      {community}, {district}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px]">Primary Crop & Size</span>
                    <span className="font-bold text-stone-900">
                      {primaryCrop} • {farmSize} Ha
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px]">Cooperative</span>
                    <span className="font-bold text-stone-900">{cooperative}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px]">Enrolling Officer</span>
                    <span className="font-bold text-stone-900">
                      {currentUserName} ({activeRole})
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block text-[11px]">GPS Stamp</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      {geo.latitude ? `${geo.latitude}, ${geo.longitude}` : 'Pending field tagging'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Offline Resilience:</strong> If working without mobile cellular reception, selecting "Save as Offline Draft" will preserve this registration locally in IndexedDB until sync is executed.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 font-semibold text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleComplete(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs"
                >
                  <Save className="w-4 h-4 text-amber-700" />
                  <span>Save Offline Draft</span>
                </button>

                <button
                  onClick={() => handleComplete(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit to Registry</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
