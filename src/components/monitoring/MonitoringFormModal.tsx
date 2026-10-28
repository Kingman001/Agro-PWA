import React, { useState } from 'react';
import {
  X,
  Camera,
  MapPin,
  Save,
  Send,
  AlertTriangle,
  ClipboardCheck,
  Sprout,
  CheckCircle2,
} from 'lucide-react';
import { FarmPlot, FieldMonitoringLog, PestSeverity, UserRole } from '../../types';
import { useGeolocation } from '../../hooks/useGeolocation';
import { offlineStorage } from '../../services/offlineStorage';

interface MonitoringFormProps {
  plots: FarmPlot[];
  onClose: () => void;
  onSubmitLog: (log: FieldMonitoringLog, isDraft: boolean) => void;
  activeRole: UserRole;
  currentUserId: string;
  currentUserName: string;
}

const COMMON_PESTS = [
  'Fall Armyworm (Spodoptera frugiperda)',
  'Cocoa Mirid Capsids (Distantiella)',
  'Stem Borer (Busseola fusca)',
  'Aphids & Whiteflies',
  'Black Pod Disease (Phytophthora)',
  'Maize Streak Virus',
];

export const MonitoringFormModal: React.FC<MonitoringFormProps> = ({
  plots,
  onClose,
  onSubmitLog,
  activeRole,
  currentUserId,
  currentUserName,
}) => {
  const geo = useGeolocation();

  const [selectedPlotId, setSelectedPlotId] = useState<string>(plots[0]?.id || '');
  const [visitDate, setVisitDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [cropStage, setCropStage] = useState('Vegetative Growth');
  const [pestSeverity, setPestSeverity] = useState<PestSeverity>('Low');
  const [selectedPests, setSelectedPests] = useState<string[]>([]);
  const [weedPressure, setWeedPressure] = useState<'Clean' | 'Moderate' | 'Heavy'>('Clean');
  const [soilMoisture, setSoilMoisture] = useState<'Adequate' | 'Dry' | 'Waterlogged'>('Adequate');
  const [yieldEstimate, setYieldEstimate] = useState<number>(40);
  const [issuesDetected, setIssuesDetected] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedPlot = plots.find((p) => p.id === selectedPlotId);

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

  const togglePest = (pestName: string) => {
    if (selectedPests.includes(pestName)) {
      setSelectedPests(selectedPests.filter((p) => p !== pestName));
    } else {
      setSelectedPests([...selectedPests, pestName]);
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!selectedPlot) {
      setErrorMsg('Please select a valid farm plot.');
      return;
    }

    if (!issuesDetected.trim()) {
      setErrorMsg('Please document agronomic observations or symptoms observed.');
      return;
    }

    const logNumber = `FL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLog: FieldMonitoringLog = {
      id: `mon-${Date.now()}`,
      logNumber,
      farmPlotId: selectedPlot.id,
      plotCode: selectedPlot.plotCode,
      farmerId: selectedPlot.farmerId,
      farmerName: selectedPlot.farmerName,
      officerId: currentUserId,
      officerName: currentUserName,
      visitDate,
      cropStage,
      pestSeverity,
      pestNames: selectedPests,
      weedPressure,
      soilMoisture,
      estimatedYieldBags: Number(yieldEstimate) || 0,
      issuesDetected,
      recommendations,
      latitude: geo.latitude || selectedPlot.latitude,
      longitude: geo.longitude || selectedPlot.longitude,
      gpsAccuracyMeters: geo.accuracy || 4.0,
      photoUrl: photoPreview || undefined,
      status: pestSeverity === 'Severe' ? 'Action Required' : 'Submitted',
      syncStatus: isDraft ? 'local_draft' : 'synced',
    };

    if (isDraft) {
      await offlineStorage.saveDraft({
        id: newLog.id,
        type: 'monitoring',
        data: newLog,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    onSubmitLog(newLog, isDraft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 uppercase tracking-wider font-semibold font-mono">
                Agronomic Survey
              </span>
              <h2 className="text-base sm:text-lg font-bold">Field Monitoring Log</h2>
            </div>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Crop stage scouting, pest pressure scoring, and GPS geotagging
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Plot Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Target Farm Plot *
              </label>
              <select
                value={selectedPlotId}
                onChange={(e) => setSelectedPlotId(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              >
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.plotCode} — {p.farmerName} ({p.cropTypes.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Inspection Date *
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              >
              </input>
            </div>
          </div>

          {/* Crop Stage & Soil Moisture */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Growth Stage</label>
              <select
                value={cropStage}
                onChange={(e) => setCropStage(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="Seedling / Germination">Seedling / Germination</option>
                <option value="Vegetative Growth">Vegetative Growth</option>
                <option value="Tasseling / Flowering">Tasseling / Flowering</option>
                <option value="Cherelle / Pod Filling">Cherelle / Pod Filling</option>
                <option value="Physiological Maturity">Physiological Maturity</option>
                <option value="Harvesting Stage">Harvesting Stage</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Weed Pressure</label>
              <select
                value={weedPressure}
                onChange={(e) => setWeedPressure(e.target.value as any)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="Clean">Clean (Well managed)</option>
                <option value="Moderate">Moderate (Spot weeding needed)</option>
                <option value="Heavy">Heavy (Yield risk)</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Soil Moisture</label>
              <select
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(e.target.value as any)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="Adequate">Adequate</option>
                <option value="Dry">Dry (Moisture stress)</option>
                <option value="Waterlogged">Waterlogged</option>
              </select>
            </div>
          </div>

          {/* Pest Severity Rating Buttons */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1.5">
              Pest & Disease Infestation Severity Rating *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['None', 'Low', 'Moderate', 'Severe'] as PestSeverity[]).map((level) => {
                const isSelected = pestSeverity === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setPestSeverity(level)}
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                      isSelected
                        ? level === 'Severe'
                          ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-200'
                          : level === 'Moderate'
                          ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-200'
                          : 'bg-emerald-700 text-white border-emerald-800 ring-2 ring-emerald-200'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Observed Pests Checklist */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1.5">
              Specific Pests / Pathogens Observed
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMON_PESTS.map((pest) => {
                const checked = selectedPests.includes(pest);
                return (
                  <label
                    key={pest}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                      checked
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                        : 'bg-stone-50/60 border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePest(pest)}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="text-[11px]">{pest}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Observations & Recommendations */}
          <div className="space-y-3">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Field Observations & Symptoms *
              </label>
              <textarea
                rows={2}
                value={issuesDetected}
                onChange={(e) => setIssuesDetected(e.target.value)}
                placeholder="e.g. Early pod boring on 15% of plants; slight chlorosis on upper leaves."
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Prescribed Recommendations & Input Needs
              </label>
              <textarea
                rows={2}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="e.g. Issue 5 liters Bio-Neem from warehouse; apply before 10 AM."
                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* GPS Capture & Photo Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
            {/* GPS */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>GPS Location Tag</span>
              </span>
              <button
                type="button"
                onClick={geo.captureGPS}
                disabled={geo.loading}
                className="w-full py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <MapPin className={`w-3.5 h-3.5 ${geo.loading ? 'animate-bounce' : ''}`} />
                <span>{geo.loading ? 'Tagging Fix...' : 'Tag Plot Coordinates'}</span>
              </button>
              {geo.latitude && (
                <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200">
                  Fixed: {geo.latitude}, {geo.longitude} (&plusmn;{geo.accuracy}m)
                </div>
              )}
            </div>

            {/* Photo Capture */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                <span>Agronomic Photo Evidence</span>
              </span>
              <label className="w-full py-1.5 px-3 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <Camera className="w-3.5 h-3.5 text-stone-500" />
                <span>Snap / Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <div className="h-12 w-20 rounded border border-stone-300 overflow-hidden">
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-stone-200 bg-white text-stone-700 font-semibold text-xs hover:bg-stone-100"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs"
            >
              <Save className="w-4 h-4 text-amber-700" />
              <span>Save Offline Draft</span>
            </button>

            <button
              onClick={() => handleSubmit(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Submit Inspection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
