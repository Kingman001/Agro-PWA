import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  ZoomIn,
  Search,
  Filter,
  Maximize2,
  Sprout,
  Compass,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { FarmPlot, UserRole } from '../../types';

interface FarmMapsProps {
  plots: FarmPlot[];
  activeRole: UserRole;
  onSelectPlot?: (plot: FarmPlot) => void;
}

export const FarmMapsModule: React.FC<FarmMapsProps> = ({ plots, activeRole }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.FeatureGroup | null>(null);

  const [selectedPlot, setSelectedPlot] = useState<FarmPlot | null>(plots[0] || null);
  const [filterCrop, setFilterCrop] = useState<string>('ALL');
  const [filterDistrict, setFilterDistrict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract filter options
  const cropList = Array.from(new Set(plots.flatMap((p) => p.cropTypes)));
  const districtList = Array.from(new Set(plots.map((p) => p.district)));

  // Filtered plots
  const filteredPlots = plots.filter((plot) => {
    if (filterCrop !== 'ALL' && !plot.cropTypes.includes(filterCrop)) return false;
    if (filterDistrict !== 'ALL' && plot.district !== filterDistrict) return false;
    if (
      searchQuery.trim() &&
      !plot.plotCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !plot.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !plot.locationName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Color helper based on primary crop
  const getCropColor = (crops: string[]) => {
    if (crops.some((c) => c.includes('Cocoa'))) return '#15803d'; // Emerald green
    if (crops.some((c) => c.includes('Maize'))) return '#d97706'; // Amber gold
    if (crops.some((c) => c.includes('Soybean'))) return '#0284c7'; // Sky blue
    if (crops.some((c) => c.includes('Cassava'))) return '#854d0e'; // Brown Ochre
    return '#4f46e5';
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on central Ghana agro belt (Kumasi/Bekwai region: ~6.68, -1.62)
    const map = L.map(mapContainerRef.current, {
      center: [6.69, -1.55],
      zoom: 9,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Glean Agro GIS',
      maxZoom: 19,
    }).addTo(map);

    const featureGroup = L.featureGroup().addTo(map);
    layersGroupRef.current = featureGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Polygons and Markers when filtered plots change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const featureGroup = layersGroupRef.current;
    if (!map || !featureGroup) return;

    featureGroup.clearLayers();

    filteredPlots.forEach((plot) => {
      const color = getCropColor(plot.cropTypes);

      // Create Custom SVG Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 6px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background-color: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      // Marker
      const marker = L.marker([plot.latitude, plot.longitude], { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; min-width: 180px;">
          <div style="font-weight: bold; color: #1c1917; font-size: 13px;">${plot.plotCode}</div>
          <div style="color: #44403c; font-weight: 600;">Farmer: ${plot.farmerName}</div>
          <div style="color: #78716c; margin-top: 2px;">Crops: ${plot.cropTypes.join(', ')}</div>
          <div style="color: #15803d; font-weight: bold; margin-top: 2px;">Area: ${plot.areaHectares} Hectares</div>
          <div style="margin-top: 4px; font-size: 10px; color: #a8a29e;">Status: ${plot.status}</div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedPlot(plot);
      });

      featureGroup.addLayer(marker);

      // Polygon Boundary
      if (plot.boundaryPolygon && plot.boundaryPolygon.length >= 3) {
        const latLngs = plot.boundaryPolygon.map((p) => [p.lat, p.lng] as [number, number]);
        const polygon = L.polygon(latLngs, {
          color: color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.25,
        });

        polygon.on('click', () => {
          setSelectedPlot(plot);
          marker.openPopup();
        });

        polygon.bindTooltip(`${plot.plotCode} (${plot.areaHectares} Ha)`, {
          sticky: true,
          direction: 'top',
        });

        featureGroup.addLayer(polygon);
      }
    });

    if (filteredPlots.length > 0 && featureGroup.getBounds().isValid()) {
      map.fitBounds(featureGroup.getBounds(), { padding: [40, 40], maxZoom: 14 });
    }
  }, [filteredPlots]);

  // Zoom to single plot when clicked from sidebar list
  const handleSelectPlotFromList = (plot: FarmPlot) => {
    setSelectedPlot(plot);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([plot.latitude, plot.longitude], 14, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Filter Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-700" />
            <span>GIS Farm Mapping & Plot Boundaries</span>
          </h2>
          <p className="text-xs text-stone-500">
            Satellite overlay with verified smallholder farm polygon parcels and health indexes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* District filter */}
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 focus:outline-none"
          >
            <option value="ALL">All Districts</option>
            {districtList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Crop filter */}
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 focus:outline-none"
          >
            <option value="ALL">All Crops</option>
            {cropList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Mapping Workspace: Split between Left List & Right Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[650px]">
        {/* Left 4 Cols: Plots Directory & Coordinate details */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-stone-200 shadow-2xs flex flex-col overflow-hidden">
          <div className="p-3 border-b border-stone-200 bg-stone-50/60">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plot code or farmer..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-stone-100 p-2 space-y-1">
            {filteredPlots.map((plot) => {
              const isSelected = selectedPlot?.id === plot.id;
              const color = getCropColor(plot.cropTypes);

              return (
                <div
                  key={plot.id}
                  onClick={() => handleSelectPlotFromList(plot)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-400 shadow-2xs'
                      : 'bg-white hover:bg-stone-50 border-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-mono font-bold text-xs text-stone-900">
                        {plot.plotCode}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
                      {plot.areaHectares} Ha
                    </span>
                  </div>

                  <div className="mt-1 text-xs font-semibold text-stone-800 truncate">
                    {plot.farmerName}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">{plot.locationName}</div>

                  <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-600">
                    <span>{plot.cropTypes.join(', ')}</span>
                    <span className="font-mono text-emerald-700">
                      {plot.latitude.toFixed(2)}°, {plot.longitude.toFixed(2)}°
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected plot coordinates breakdown panel */}
          {selectedPlot && (
            <div className="p-3 border-t border-stone-200 bg-stone-50 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-stone-900">
                <span>Selected: {selectedPlot.plotCode}</span>
                <span className="text-[10px] font-mono text-stone-500">
                  {selectedPlot.boundaryPolygon.length} vertex polygon
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-stone-600">
                <div>Soil: {selectedPlot.soilType}</div>
                <div>Irrigation: {selectedPlot.irrigationType}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right 8 Cols: Interactive Leaflet Map */}
        <div className="lg:col-span-8 bg-stone-100 rounded-xl border border-stone-200 shadow-2xs overflow-hidden relative">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-stone-200 shadow-md text-xs space-y-2">
            <div className="font-bold text-stone-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-stone-600" />
              <span>Crop Parcel Legend</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-stone-700">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#15803d]" />
                <span>Cocoa</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#d97706]" />
                <span>Yellow Maize</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#0284c7]" />
                <span>Soybeans</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#854d0e]" />
                <span>Cassava</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
