import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Factory, AlertTriangle, Layers, Info, X, Compass, Activity, Eye, Route as RouteIcon, Package, Truck, DollarSign } from 'lucide-react';
import L from 'leaflet';
import { api } from '../api';

interface MapTabProps {
  mapData: any;
}

export const MapTab: React.FC<MapTabProps> = ({ mapData: initialMapData }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapData, setMapData] = useState<any>(initialMapData);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedFactory, setSelectedFactory] = useState<string | null>(null);
  const [stateAnalytics, setStateAnalytics] = useState<any | null>(null);
  const [factoryAnalytics, setFactoryAnalytics] = useState<any | null>(null);
  const [loadingState, setLoadingState] = useState(false);
  const [mapMode, setMapMode] = useState<'risk' | 'volume' | 'lead_time'>('risk');
  const [basemap, setBasemap] = useState<'voyager' | 'dark' | 'osm'>('voyager');
  const [showCorridors, setShowCorridors] = useState(true);

  // Basemap tile URLs
  const BASEMAPS = {
    voyager: {
      url: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CartoDB & OpenStreetMap contributors'
    },
    dark: {
      url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CartoDB & OpenStreetMap contributors'
    },
    osm: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    }
  };

  // Auto-fetch if not provided
  useEffect(() => {
    if (initialMapData && initialMapData.states && initialMapData.states.length > 0) {
      setMapData(initialMapData);
    } else {
      api.getMapData()
        .then(res => setMapData(res))
        .catch(err => console.error("Failed to load map data:", err));
    }
  }, [initialMapData]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Clean up any stale leaflet ID to prevent StrictMode collision
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      center: [38.5, -96.5],
      zoom: 4,
      minZoom: 3,
      maxZoom: 10
    });

    // Add initial tile layer (CartoDB Voyager - bright, clear US state borders & labels)
    const initialTiles = L.tileLayer(BASEMAPS[basemap].url, {
      attribution: BASEMAPS[basemap].attribution,
      maxZoom: 19
    }).addTo(map);
    tileLayerRef.current = initialTiles;

    // Fit explicitly to US bounds
    map.fitBounds([
      [24.5, -124.8],
      [49.4, -66.9]
    ], { padding: [15, 15] });

    mapInstanceRef.current = map;

    // Force tile recalculation after layout paints
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer when basemap switches
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const newTiles = L.tileLayer(BASEMAPS[basemap].url, {
      attribution: BASEMAPS[basemap].attribution,
      maxZoom: 19
    }).addTo(map);
    tileLayerRef.current = newTiles;
  }, [basemap]);

  // Update Markers, Corridors and Layers when mapData, mapMode, or showCorridors change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapData) return;

    map.invalidateSize();

    // Clear existing dynamic markers & polylines
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Custom Factory Icon
    const factoryIcon = L.divIcon({
      className: 'custom-factory-icon',
      html: `
        <div style="background: #0284c7; color: white; width: 34px; height: 34px; border-radius: 9px; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(2,132,199,0.7); cursor: pointer; transition: transform 0.15s ease;">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4H2z"/></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    // 1. Draw Route Corridors if enabled
    if (showCorridors && mapData.routes) {
      mapData.routes.forEach((r: any) => {
        const isHighlighted = (selectedFactory && r.factory_name === selectedFactory) ||
                              (selectedState && r.destination_state === selectedState);

        const strokeColor = isHighlighted ? '#38bdf8' : (basemap === 'voyager' ? '#64748b' : '#334155');
        const strokeOpacity = isHighlighted ? 0.95 : (basemap === 'voyager' ? 0.22 : 0.18);
        const strokeWeight = isHighlighted ? 3.5 : 1.2;

        const line = L.polyline(
          [[r.origin_lat, r.origin_lng], [r.dest_lat, r.dest_lng]],
          {
            color: strokeColor,
            weight: strokeWeight,
            opacity: strokeOpacity,
            dashArray: isHighlighted ? '6, 6' : undefined
          }
        ).addTo(map);

        line.bindTooltip(`
          <strong>${r.factory_name} &rarr; ${r.destination_state}</strong><br/>
          Shipments: ${r.shipments_count} | Lead Time: ${r.avg_lead_time}d<br/>
          Efficiency: ${r.efficiency_score}/100 (${r.performance_tier})
        `, { direction: 'top' });
      });
    }

    // 2. Add Factory Markers with Rich Tooltip AND Click Handler
    if (mapData.factories) {
      mapData.factories.forEach((f: any) => {
        const marker = L.marker([f.lat, f.lng], { icon: factoryIcon }).addTo(map);

        // Tooltip on Hover
        marker.bindTooltip(`
          <div style="font-family: inherit; font-size: 12px; min-width: 200px; padding: 2px;">
            <div style="font-weight: 800; color: #0284c7; font-size: 13px;">${f.name}</div>
            <div style="color: #64748b; font-size: 11px;">${f.city}, ${f.state} (${f.id})</div>
            <div style="margin-top: 5px; font-weight: 600; color: #0369a1; background: #e0f2fe; padding: 2px 7px; border-radius: 4px; display: inline-block; font-size: 10px;">
              ${f.specialization}
            </div>
            <div style="margin-top: 6px; border-top: 1px solid #e2e8f0; padding-top: 5px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; color: #0f172a;">
              <div>Volume: <strong>${f.total_shipments ? f.total_shipments.toLocaleString() : 'N/A'}</strong></div>
              <div>Units: <strong>${f.total_units ? f.total_units.toLocaleString() : 'N/A'}</strong></div>
              <div>Lead Time: <strong>${f.avg_operational_lead_time ? f.avg_operational_lead_time + 'd' : 'N/A'}</strong></div>
              <div>Delay: <strong>${f.delay_rate_pct !== undefined ? f.delay_rate_pct + '%' : 'N/A'}</strong></div>
            </div>
            <div style="margin-top: 6px; font-size: 10px; color: #0284c7; font-weight: 600;">
              &rarr; Click to inspect full facility analytics & lanes
            </div>
          </div>
        `, { direction: 'top', className: 'custom-tooltip' });

        // Click on Factory Marker
        marker.on('click', () => {
          handleFactoryClick(f);
        });
      });
    }

    // 3. Add Destination State Markers
    if (mapData.states) {
      mapData.states.forEach((s: any) => {
        if (!s.lat || !s.lng) return;

        let color = '#0284c7';
        let radius = 7;

        if (mapMode === 'risk') {
          color = s.delay_rate_pct >= 25 ? '#ef4444' : (s.delay_rate_pct >= 15 ? '#f59e0b' : '#10b981');
        } else if (mapMode === 'volume') {
          radius = Math.max(6, Math.min(22, (s.total_shipments / 1200) * 22));
          color = '#6366f1';
        } else if (mapMode === 'lead_time') {
          color = s.avg_operational_lead_time >= 5.0 ? '#ef4444' : (s.avg_operational_lead_time >= 4.0 ? '#0284c7' : '#10b981');
        }

        const circle = L.circleMarker([s.lat, s.lng], {
          radius: radius,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          opacity: 0.95,
          fillOpacity: 0.85
        }).addTo(map);

        circle.bindTooltip(`
          <div style="font-family: inherit; font-size: 12px; padding: 2px;">
            <strong style="font-size: 13px;">${s.state_name} (${s.code})</strong><br/>
            Volume: <strong>${s.total_shipments.toLocaleString()}</strong> shipments<br/>
            Avg Lead Time: <strong>${s.avg_operational_lead_time} days</strong><br/>
            Delay Rate: <strong>${s.delay_rate_pct}%</strong> (${s.risk_level})<br/>
            <span style="font-size: 10px; color: #0284c7; font-weight: 600;">&rarr; Click to inspect state analytics</span>
          </div>
        `, { direction: 'top', className: 'custom-tooltip' });

        circle.on('click', () => {
          handleStateClick(s.state_name);
        });
      });
    }
  }, [mapData, mapMode, basemap, showCorridors, selectedFactory, selectedState]);

  const handleFactoryClick = (f: any) => {
    if (selectedFactory === f.name) {
      setSelectedFactory(null);
      setFactoryAnalytics(null);
    } else {
      setSelectedFactory(f.name);
      setFactoryAnalytics(f);
      setSelectedState(null);
      setStateAnalytics(null);
    }
  };

  const handleStateClick = async (stateName: string) => {
    setSelectedState(stateName);
    setSelectedFactory(null);
    setFactoryAnalytics(null);
    setLoadingState(true);
    try {
      const res = await api.getStateAnalytics(stateName);
      setStateAnalytics(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Layer Mode Selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            United States Geographic Logistics Network
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive map displaying Nassau Candy's 5 manufacturing facilities and 59 destination states & territories across the US.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Basemap Style Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] font-semibold text-slate-400 px-2 flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-500" />
              Base:
            </span>
            <button
              onClick={() => setBasemap('voyager')}
              className={`px-2.5 py-1 rounded font-medium text-xs transition-all ${basemap === 'voyager' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              US Atlas
            </button>
            <button
              onClick={() => setBasemap('dark')}
              className={`px-2.5 py-1 rounded font-medium text-xs transition-all ${basemap === 'dark' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Dark Mode
            </button>
            <button
              onClick={() => setBasemap('osm')}
              className={`px-2.5 py-1 rounded font-medium text-xs transition-all ${basemap === 'osm' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              OSM
            </button>
          </div>

          {/* Metric Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] font-semibold text-slate-400 px-2 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-500" />
              Metric:
            </span>
            <button
              onClick={() => setMapMode('risk')}
              className={`px-2.5 py-1 rounded font-medium text-xs transition-all ${mapMode === 'risk' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              SLA Delay Risk
            </button>
            <button
              onClick={() => setMapMode('volume')}
              className={`px-2.5 py-1 rounded font-medium text-xs transition-all ${mapMode === 'volume' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Volume
            </button>
            <button
              onClick={() => setMapMode('lead_time')}
              className={`px-2.5 py-1 rounded font-medium text-xs transition-all ${mapMode === 'lead_time' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              Lead Time
            </button>
          </div>

          {/* Shipping Corridors Toggle */}
          <button
            onClick={() => setShowCorridors(!showCorridors)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${showCorridors ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'}`}
          >
            <RouteIcon className="w-3.5 h-3.5" />
            {showCorridors ? 'Corridors: ON' : 'Corridors: OFF'}
          </button>
        </div>
      </div>

      {/* Map Canvas and Drawer Container */}
      <div className="relative rounded-2xl border border-slate-800 overflow-hidden shadow-2xl h-[600px] bg-slate-950">
        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%', minHeight: '600px' }} className="z-0" />

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/95 backdrop-blur p-3.5 rounded-xl border border-slate-800 text-xs shadow-xl space-y-2 max-w-xs">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1 text-xs">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            Network Legend
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-sky-600 border border-white"></div>
            <span className="text-slate-300 text-[11px] font-medium">5 Candy Manufacturing Hubs (Click/Hover)</span>
          </div>
          {mapMode === 'risk' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <span className="text-slate-400 text-[11px]">High Delay Risk (&gt;25%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <span className="text-slate-400 text-[11px]">Moderate Risk (15–25%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                <span className="text-slate-400 text-[11px]">Low Risk (&lt;15%)</span>
              </div>
            </>
          )}
          {mapMode === 'volume' && (
            <div className="text-[11px] text-slate-400">
              Marker radius proportional to order count (e.g., California 1,148 orders).
            </div>
          )}
          {mapMode === 'lead_time' && (
            <div className="text-[11px] text-slate-400">
              Color indicates delivery duration: Green &lt;4.0d, Blue 4.0–4.9d, Red &ge;5.0d.
            </div>
          )}
          {showCorridors && (
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
              Lines represent active shipping corridors from factory to destination state.
            </div>
          )}
        </div>

        {/* State Detail Flyout Drawer */}
        {selectedState && (
          <div className="absolute top-4 right-4 z-10 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-5 w-84 shadow-2xl animate-in slide-in-from-right duration-200 max-h-[550px] overflow-y-auto">
            <button
              onClick={() => { setSelectedState(null); setStateAnalytics(null); }}
              className="absolute right-3.5 top-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-xs">
                {stateAnalytics?.code || selectedState.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{selectedState}</h3>
                <span className="text-[10px] text-slate-400">{stateAnalytics?.region || 'United States'} Destination</span>
              </div>
            </div>

            {loadingState ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading state analytics...</div>
            ) : stateAnalytics ? (
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500">Total Volume</span>
                    <div className="font-bold text-slate-200 mt-0.5">{stateAnalytics.total_shipments?.toLocaleString()} orders</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500">Delay Rate</span>
                    <div className={`font-bold mt-0.5 ${stateAnalytics.delay_rate_pct > 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {stateAnalytics.delay_rate_pct}%
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Operational Lead Time:</span>
                    <span className="font-semibold text-sky-400">{stateAnalytics.avg_operational_lead_time} days</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Total Revenue:</span>
                    <span className="font-semibold text-emerald-400">${stateAnalytics.total_sales?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Primary Mode:</span>
                    <span className="font-semibold text-slate-200">{stateAnalytics.most_used_ship_mode || 'Standard Class'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Top Demand Products
                  </div>
                  <div className="space-y-1">
                    {stateAnalytics.top_products?.slice(0, 3).map((tp: any) => (
                      <div key={tp.product} className="flex items-center justify-between text-[11px] bg-slate-950/60 px-2 py-1 rounded border border-slate-850">
                        <span className="text-slate-300 truncate max-w-[170px]">{tp.product}</span>
                        <span className="text-slate-500 font-mono">{tp.orders}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Factory Detail Flyout Drawer */}
        {selectedFactory && factoryAnalytics && (
          <div className="absolute top-4 right-4 z-10 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-5 w-88 shadow-2xl animate-in slide-in-from-right duration-200 max-h-[550px] overflow-y-auto">
            <button
              onClick={() => { setSelectedFactory(null); setFactoryAnalytics(null); }}
              className="absolute right-3.5 top-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{factoryAnalytics.name}</h3>
                <span className="text-[10px] text-sky-400 font-medium">{factoryAnalytics.city}, {factoryAnalytics.state} ({factoryAnalytics.id})</span>
              </div>
            </div>

            <div className="bg-sky-500/10 border border-sky-500/20 text-sky-300 px-3 py-1.5 rounded-lg text-xs font-medium mb-3">
              {factoryAnalytics.specialization}
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500">Total Volume</span>
                  <div className="font-bold text-slate-200 mt-0.5">{factoryAnalytics.total_shipments?.toLocaleString()} orders</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500">Total Units</span>
                  <div className="font-bold text-slate-200 mt-0.5">{factoryAnalytics.total_units?.toLocaleString()} units</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500">Lead Time</span>
                  <div className="font-bold text-sky-400 mt-0.5">{factoryAnalytics.avg_operational_lead_time} days</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500">Delay Rate</span>
                  <div className={`font-bold mt-0.5 ${factoryAnalytics.delay_rate_pct > 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {factoryAnalytics.delay_rate_pct}%
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Total Revenue:</span>
                  <span className="font-semibold text-emerald-400">${factoryAnalytics.total_sales?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Gross Profit:</span>
                  <span className="font-semibold text-emerald-300">${factoryAnalytics.total_profit?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Active Corridors:</span>
                  <span className="font-semibold text-sky-300">{factoryAnalytics.active_routes_count || 'N/A'} state lanes</span>
                </div>
              </div>

              {factoryAnalytics.products && factoryAnalytics.products.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Manufactured Products
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {factoryAnalytics.products.map((p: string) => (
                      <span key={p} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 text-[10px] text-sky-400 flex items-center gap-1.5 border-t border-slate-800">
                <RouteIcon className="w-3.5 h-3.5" />
                <span>Outbound routes from this facility are highlighted in bright cyan on the map.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
