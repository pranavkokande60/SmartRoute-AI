import React, { useState, useEffect } from 'react';
import {
  GitCompare, ArrowRight, Award, Zap, AlertTriangle,
  Clock, TrendingUp, ShieldCheck, CheckCircle2, X, Plus,
  MapPin, Factory, Truck, Sparkles, RefreshCw, BarChart2,
  Percent, Activity
} from 'lucide-react';
import { api } from '../api';

export const RouteComparisonTab: React.FC = () => {
  const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([
    "Wicked Choccy's -> California",
    "Lot's O' Nuts -> California"
  ]);
  const [selectedRouteToAdd, setSelectedRouteToAdd] = useState<string>("");

  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load list of available routes
  useEffect(() => {
    api.getRoutes({ limit: 200 })
      .then((routes) => {
        setAvailableRoutes(routes);
        // Default to two real routes if initial ones aren't available
        if (routes.length >= 2) {
          const r1 = routes[0].route_id;
          const r2 = routes[1].route_id;
          setSelectedRouteIds([r1, r2]);
        }
      })
      .catch(console.error);
  }, []);

  const fetchComparison = async (routeIdsToCompare: string[]) => {
    if (routeIdsToCompare.length < 2) {
      setErrorMsg("Please select at least 2 routes to generate side-by-side comparison.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.compareRoutes(routeIdsToCompare);
      setComparisonData(res);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to compare routes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRouteIds.length >= 2) {
      fetchComparison(selectedRouteIds);
    }
  }, [selectedRouteIds]);

  const handleAddRoute = () => {
    if (!selectedRouteToAdd) return;
    if (selectedRouteIds.includes(selectedRouteToAdd)) return;
    if (selectedRouteIds.length >= 5) {
      alert("Maximum 5 routes can be compared simultaneously.");
      return;
    }
    const updated = [...selectedRouteIds, selectedRouteToAdd];
    setSelectedRouteIds(updated);
    setSelectedRouteToAdd("");
  };

  const handleRemoveRoute = (routeId: string) => {
    if (selectedRouteIds.length <= 2) {
      alert("A minimum of 2 routes is required for side-by-side comparison.");
      return;
    }
    const updated = selectedRouteIds.filter(id => id !== routeId);
    setSelectedRouteIds(updated);
  };

  const handlePresetSelect = (presetRoutes: string[]) => {
    setSelectedRouteIds(presetRoutes);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            Route Comparison Tool
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Side-by-side benchmarking of delivery speed, SLA delay rates, transit variability, and route efficiency across factory corridors.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Comparing: <strong className="text-indigo-400">{selectedRouteIds.length}</strong> corridors</span>
        </div>
      </div>

      {/* Route Selection & Presets Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        {/* Route Selector Input Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Add Route Corridor to Comparison
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedRouteToAdd}
                onChange={(e) => setSelectedRouteToAdd(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select a corridor from catalog...</option>
                {availableRoutes
                  .filter(r => !selectedRouteIds.includes(r.route_id))
                  .map(r => (
                    <option key={r.route_id} value={r.route_id}>
                      {r.route_id} — Score: {r.efficiency_score}/100 ({r.performance_tier})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddRoute}
                disabled={!selectedRouteToAdd}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Route</span>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="sm:border-l sm:border-slate-800 sm:pl-4 self-end sm:self-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Comparison Presets
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {availableRoutes.length >= 4 && (
                <>
                  <button
                    onClick={() => handlePresetSelect([availableRoutes[0]?.route_id, availableRoutes[availableRoutes.length - 1]?.route_id])}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 transition-all"
                  >
                    Top vs Bottleneck
                  </button>
                  <button
                    onClick={() => handlePresetSelect([availableRoutes[0]?.route_id, availableRoutes[1]?.route_id, availableRoutes[2]?.route_id])}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 transition-all"
                  >
                    Top 3 Efficient
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Selected Route Badges */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/60">
          <span className="text-xs text-slate-500">Active Corridors:</span>
          {selectedRouteIds.map((rid, idx) => (
            <span
              key={rid}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-200 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>{rid}</span>
              <button
                type="button"
                onClick={() => handleRemoveRoute(rid)}
                className="text-slate-500 hover:text-rose-400 transition-colors ml-0.5"
                title="Remove from comparison"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Comparison Results */}
      {comparisonData && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Verdict Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Executive Performance Recommendation
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {comparisonData.summary_verdict}
                  </h3>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 shrink-0 text-right">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Recommended</span>
                  <strong className="text-xs text-emerald-400">{comparisonData.best_performing_route_id}</strong>
                </div>
              </div>
            </div>

            {/* Differential Comparative Insights */}
            {comparisonData.insights?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-3 border-t border-slate-800/80">
                {comparisonData.insights.map((insight: string, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-850 text-xs text-slate-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side-by-Side Metric Comparison Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Side-by-Side Corridor Matrix
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">Green indicates superior metric</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <th className="py-3.5 px-4 font-semibold w-48">Performance Metric</th>
                    {comparisonData.routes.map((r: any) => {
                      const isBest = r.route_id === comparisonData.best_performing_route_id;
                      return (
                        <th key={r.route_id} className={`py-3.5 px-4 font-bold text-slate-200 ${isBest ? 'bg-indigo-950/30 border-l border-r border-indigo-500/20' : ''}`}>
                          <div className="flex items-center gap-2">
                            <span>{r.route_id}</span>
                            {isBest && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                Best
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {/* Efficiency Score */}
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-400">Route Efficiency Score</td>
                    {comparisonData.routes.map((r: any) => (
                      <td key={r.route_id} className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold font-mono ${
                            r.efficiency_score >= 80 ? 'text-emerald-400' : (r.efficiency_score >= 60 ? 'text-amber-400' : 'text-rose-400')
                          }`}>
                            {r.efficiency_score}/100
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal">({r.performance_tier})</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Avg Lead Time */}
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-400">Average Lead Time</td>
                    {comparisonData.routes.map((r: any) => {
                      const isFastest = r.route_id === comparisonData.fastest_route_id;
                      return (
                        <td key={r.route_id} className="py-3 px-4">
                          <span className={`font-mono font-bold text-sm ${isFastest ? 'text-emerald-400' : 'text-white'}`}>
                            {r.avg_lead_time} days
                          </span>
                          {isFastest && <span className="ml-1.5 text-[10px] text-emerald-400 font-semibold">⚡ Fastest</span>}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Median Lead Time */}
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-400">Median Lead Time</td>
                    {comparisonData.routes.map((r: any) => (
                      <td key={r.route_id} className="py-3 px-4 font-mono">
                        {r.median_lead_time} days
                      </td>
                    ))}
                  </tr>

                  {/* Lead Time Variability */}
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-400">Lead Time Std Dev (Variability)</td>
                    {comparisonData.routes.map((r: any) => (
                      <td key={r.route_id} className="py-3 px-4 font-mono">
                        ±{r.std_lead_time} days
                      </td>
                    ))}
                  </tr>

                  {/* Delay Rate */}
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-400">Delay Breach Rate (%)</td>
                    {comparisonData.routes.map((r: any) => {
                      const isMostReliable = r.route_id === comparisonData.most_reliable_route_id;
                      return (
                        <td key={r.route_id} className="py-3 px-4">
                          <span className={`font-mono font-bold text-sm ${
                            isMostReliable ? 'text-emerald-400' : (r.delay_rate_pct > 15 ? 'text-rose-400' : 'text-amber-400')
                          }`}>
                            {r.delay_rate_pct}%
                          </span>
                          <span className="text-[10px] text-slate-500 ml-1.5">({r.delay_count} delayed)</span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Total Volume */}
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-400">Historical Shipment Volume</td>
                    {comparisonData.routes.map((r: any) => (
                      <td key={r.route_id} className="py-3 px-4 font-mono">
                        {r.shipments_count.toLocaleString()} shipments
                      </td>
                    ))}
                  </tr>

                  {/* Distance */}
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-400">Transit Distance</td>
                    {comparisonData.routes.map((r: any) => (
                      <td key={r.route_id} className="py-3 px-4 font-mono">
                        {r.distance_miles} miles
                      </td>
                    ))}
                  </tr>

                  {/* Preferred Ship Mode */}
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-400">Preferred Ship Mode</td>
                    {comparisonData.routes.map((r: any) => (
                      <td key={r.route_id} className="py-3 px-4 text-sky-400 font-semibold">
                        {r.preferred_ship_mode}
                      </td>
                    ))}
                  </tr>

                  {/* Bottleneck Status */}
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-400">Bottleneck Designation</td>
                    {comparisonData.routes.map((r: any) => (
                      <td key={r.route_id} className="py-3 px-4">
                        {r.is_bottleneck ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Bottleneck Corridor
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Clear Corridor
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Primary Delay Root Cause */}
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-400">Primary Delay Root Cause</td>
                    {comparisonData.routes.map((r: any) => (
                      <td key={r.route_id} className="py-3 px-4 text-slate-400 italic">
                        {r.most_frequent_delay_reason}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
