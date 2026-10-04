import React, { useState, useEffect } from 'react';
import {
  GitFork, Search, Filter, ShieldCheck, AlertCircle, ArrowUpDown,
  ChevronRight, ExternalLink, X, Clock, AlertTriangle, Layers,
  ChevronLeft, Package, Database, FileText, CheckCircle2
} from 'lucide-react';
import { api } from '../api';

interface RoutesTabProps {
  routes: any[];
}

export const RoutesTab: React.FC<RoutesTabProps> = ({ routes }) => {
  // View mode: 'routes' (196 corridors) or 'shipments' (all 10,194 uploaded records)
  const [viewMode, setViewMode] = useState<'routes' | 'shipments'>('routes');

  // Route Explorer state
  const [search, setSearch] = useState('');
  const [factoryFilter, setFactoryFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [bottleneckOnly, setBottleneckOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'efficiency_score' | 'shipments_count' | 'avg_lead_time' | 'delay_rate'>('efficiency_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);
  const [routeDetail, setRouteDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Raw Shipments Browser state
  const [shipmentsData, setShipmentsData] = useState<any[]>([]);
  const [totalShipmentsCount, setTotalShipmentsCount] = useState(10194);
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [shipmentFactory, setShipmentFactory] = useState('ALL');
  const [shipmentMode, setShipmentMode] = useState('ALL');
  const [shipmentPage, setShipmentPage] = useState(1);
  const [shipmentPageSize, setShipmentPageSize] = useState(25);
  const [loadingShipments, setLoadingShipments] = useState(false);

  const factories = Array.from(new Set(routes.map(r => r.factory_name))).filter(Boolean);
  const tiers = ["High Performance", "Moderate Performance", "Needs Attention", "High Delay Risk"];

  // Filter routes
  const filteredRoutes = routes.filter(r => {
    if (factoryFilter !== 'ALL' && r.factory_name !== factoryFilter) return false;
    if (tierFilter !== 'ALL' && r.performance_tier !== tierFilter) return false;
    if (bottleneckOnly && !r.is_bottleneck) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.route_id.toLowerCase().includes(q) ||
        r.destination_state.toLowerCase().includes(q) ||
        r.factory_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort routes
  filteredRoutes.sort((a, b) => {
    let vA = a[sortBy];
    let vB = b[sortBy];
    if (sortAsc) return vA > vB ? 1 : -1;
    return vA < vB ? 1 : -1;
  });

  // Paginate routes
  const totalPages = pageSize === 0 ? 1 : Math.ceil(filteredRoutes.length / pageSize);
  const displayedRoutes = pageSize === 0
    ? filteredRoutes
    : filteredRoutes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Load shipments when in 'shipments' mode
  useEffect(() => {
    if (viewMode === 'shipments') {
      setLoadingShipments(true);
      api.getShipments({
        search: shipmentSearch || undefined,
        factory: shipmentFactory !== 'ALL' ? shipmentFactory : undefined,
        ship_mode: shipmentMode !== 'ALL' ? shipmentMode : undefined,
        limit: shipmentPageSize,
        offset: (shipmentPage - 1) * shipmentPageSize
      })
        .then((res) => {
          setShipmentsData(res.shipments);
          setTotalShipmentsCount(res.total_count);
        })
        .catch(console.error)
        .finally(() => setLoadingShipments(false));
    }
  }, [viewMode, shipmentSearch, shipmentFactory, shipmentMode, shipmentPage, shipmentPageSize]);

  const handleOpenDetail = async (r: any) => {
    setSelectedRoute(r);
    setLoadingDetail(true);
    try {
      const res = await api.getRouteDetail(r.route_id);
      setRouteDetail(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "High Performance":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Moderate Performance":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "Needs Attention":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "High Delay Risk":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Mode Toggle */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitFork className="w-5 h-5 text-sky-400" />
            Logistics Route & Shipment Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch between aggregated corridor intelligence (196 routes) and the complete uploaded order records (10,194 shipments).
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
          <button
            onClick={() => setViewMode('routes')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'routes'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Corridors (196 Routes)</span>
          </button>
          <button
            onClick={() => setViewMode('shipments')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'shipments'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>All Shipments (10,194 Rows)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ROUTE CORRIDORS (196 ROUTES) */}
      {viewMode === 'routes' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search route or state..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Factory Filter */}
            <select
              value={factoryFilter}
              onChange={(e) => { setFactoryFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Manufacturing Hubs</option>
              {factories.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={(e) => { setTierFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Performance Tiers</option>
              {tiers.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Sort & Bottlenecks */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="efficiency_score">Score (0–100)</option>
                <option value="shipments_count">Shipment Volume</option>
                <option value="avg_lead_time">Avg Lead Time</option>
                <option value="delay_rate">Delay Frequency</option>
              </select>
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 shrink-0"
                title="Toggle sort direction"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Routes Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Route Corridor</th>
                    <th className="py-3 px-3">Volume</th>
                    <th className="py-3 px-3">Avg Lead Time</th>
                    <th className="py-3 px-3">Delay Rate</th>
                    <th className="py-3 px-3">Efficiency Score</th>
                    <th className="py-3 px-3">Performance Tier</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {displayedRoutes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No routes found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    displayedRoutes.map((r) => (
                      <tr
                        key={r.route_id}
                        onClick={() => handleOpenDetail(r)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200 group-hover:text-sky-400 transition-colors">
                            {r.route_id}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{r.region} Region</span>
                            {r.distance_miles && (
                              <span>• {r.distance_miles.toLocaleString()} mi</span>
                            )}
                            {r.is_bottleneck && (
                              <span className="text-amber-400 font-semibold">• Bottleneck</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-medium">
                          {r.shipments_count.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-semibold text-slate-200">
                            {r.avg_lead_time} days
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            ±{r.std_lead_time}d
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-semibold ${r.delay_percentage > 25 ? 'text-rose-400' : (r.delay_percentage > 10 ? 'text-amber-400' : 'text-emerald-400')}`}>
                            {r.delay_percentage}%
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {r.delay_count} breaches
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-baseline gap-1 font-bold text-sm">
                            <span className={r.efficiency_score >= 75 ? 'text-emerald-400' : (r.efficiency_score >= 50 ? 'text-sky-400' : 'text-amber-400')}>
                              {r.efficiency_score}
                            </span>
                            <span className="text-[10px] text-slate-500">/ 100</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getTierBadge(r.performance_tier)}`}>
                            {r.performance_tier}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-slate-400 group-hover:text-sky-400 transition-colors p-1">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span>Showing {displayedRoutes.length} of {filteredRoutes.length} corridors</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Page Size:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-300"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={0}>All (196)</option>
                  </select>
                </div>
              </div>

              {pageSize > 0 && totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-xs font-semibold text-slate-200">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RAW SHIPMENTS BROWSER (ALL 10,194 RECORDS) */}
      {viewMode === 'shipments' && (
        <div className="space-y-4">
          {/* Shipments Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Order ID, Product, City..."
                value={shipmentSearch}
                onChange={(e) => { setShipmentSearch(e.target.value); setShipmentPage(1); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <select
              value={shipmentFactory}
              onChange={(e) => { setShipmentFactory(e.target.value); setShipmentPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All 5 Factories</option>
              {factories.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            <select
              value={shipmentMode}
              onChange={(e) => { setShipmentMode(e.target.value); setShipmentPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All 4 Ship Modes</option>
              <option value="Standard Class">Standard Class</option>
              <option value="Second Class">Second Class</option>
              <option value="First Class">First Class</option>
              <option value="Same Day">Same Day</option>
            </select>

            <div className="flex items-center justify-end text-[11px] text-sky-400 font-semibold px-2">
              <span>{totalShipmentsCount.toLocaleString()} Total Uploaded Records</span>
            </div>
          </div>

          {/* Raw Shipments Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Row ID</th>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Origin Factory</th>
                    <th className="py-2.5 px-3">Destination</th>
                    <th className="py-2.5 px-3">Ship Mode</th>
                    <th className="py-2.5 px-3">Units</th>
                    <th className="py-2.5 px-3">Sales ($)</th>
                    <th className="py-2.5 px-3">Op Lead Time</th>
                    <th className="py-2.5 px-3">Raw Lead Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {loadingShipments ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                        Querying database records...
                      </td>
                    </tr>
                  ) : shipmentsData.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                        No shipment records matched your search.
                      </td>
                    </tr>
                  ) : (
                    shipmentsData.map((s) => (
                      <tr key={s.row_id} className="hover:bg-slate-850 transition-colors">
                        <td className="py-2 px-3 text-slate-500">#{s.row_id}</td>
                        <td className="py-2 px-3 text-slate-200 font-semibold truncate max-w-[150px]" title={s.order_id}>
                          {s.order_id}
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-300 truncate max-w-[180px]" title={s.product_name}>
                          {s.product_name}
                        </td>
                        <td className="py-2 px-3 font-sans text-sky-400">{s.factory_name}</td>
                        <td className="py-2 px-3 font-sans text-slate-300">{s.city}, {s.state_province}</td>
                        <td className="py-2 px-3 font-sans text-slate-400">{s.ship_mode}</td>
                        <td className="py-2 px-3 text-slate-300 font-bold">{s.units}</td>
                        <td className="py-2 px-3 text-emerald-400">${s.sales.toFixed(2)}</td>
                        <td className="py-2 px-3 font-bold text-sky-400">{s.operational_lead_time_days}d</td>
                        <td className="py-2 px-3 text-slate-500">{s.raw_lead_time_days}d</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Shipments Pagination */}
            <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <div>
                Showing {(shipmentPage - 1) * shipmentPageSize + 1} to {Math.min(shipmentPage * shipmentPageSize, totalShipmentsCount)} of {totalShipmentsCount.toLocaleString()} records
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={shipmentPage === 1}
                  onClick={() => setShipmentPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="font-semibold text-slate-200">
                  Page {shipmentPage} of {Math.ceil(totalShipmentsCount / shipmentPageSize)}
                </span>
                <button
                  disabled={shipmentPage >= Math.ceil(totalShipmentsCount / shipmentPageSize)}
                  onClick={() => setShipmentPage(p => p + 1)}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Detail Modal */}
      {selectedRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => { setSelectedRoute(null); setRouteDetail(null); }}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
                <GitFork className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedRoute.route_id}</h3>
                <p className="text-xs text-slate-400">
                  {selectedRoute.distance_miles ? `${selectedRoute.distance_miles.toLocaleString()} miles transit corridor` : 'Trans-regional delivery corridor'}
                </p>
              </div>
            </div>

            {/* Score Breakdown Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300">Route Efficiency Breakdown</span>
                <span className="text-base font-bold text-sky-400">{selectedRoute.efficiency_score} / 100</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Lead Time (40%)</div>
                  <div className="font-bold text-slate-200 mt-0.5">{selectedRoute.comp_lead_time}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Delay Rate (40%)</div>
                  <div className="font-bold text-slate-200 mt-0.5">{selectedRoute.comp_delay_rate}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Stability (20%)</div>
                  <div className="font-bold text-slate-200 mt-0.5">{selectedRoute.comp_variability}</div>
                </div>
              </div>
            </div>

            {/* Operational vs Raw Lead Time */}
            <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-400 font-semibold">Operational Lead Time</span>
                <div className="text-lg font-bold text-white mt-1">{selectedRoute.avg_lead_time} days</div>
                <p className="text-[10px] text-slate-400 mt-0.5">True transit time (min: {selectedRoute.min_lead_time}d, max: {selectedRoute.max_lead_time}d)</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-400 font-semibold">Raw Dataset Lead Time</span>
                <div className="text-lg font-bold text-white mt-1">{selectedRoute.raw_avg_lead_time} days</div>
                <p className="text-[10px] text-slate-400 mt-0.5">Preserved historical unnormalized timestamp offset</p>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Recent Correlated Shipments
              </h4>
              {loadingDetail ? (
                <div className="text-xs text-slate-500 py-4 text-center">Loading shipment records...</div>
              ) : (
                <div className="overflow-x-auto max-h-48 rounded-lg border border-slate-800">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950 text-slate-400">
                      <tr>
                        <th className="py-2 px-3">Order ID</th>
                        <th className="py-2 px-3">Product</th>
                        <th className="py-2 px-3">Mode</th>
                        <th className="py-2 px-3">Op Lead Time</th>
                        <th className="py-2 px-3">SLA Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {routeDetail?.recent_shipments?.slice(0, 10).map((s: any) => (
                        <tr key={s.order_id} className="hover:bg-slate-850">
                          <td className="py-1.5 px-3 font-mono text-slate-300">{s.order_id}</td>
                          <td className="py-1.5 px-3 text-slate-300">{s.product_name}</td>
                          <td className="py-1.5 px-3 text-slate-400">{s.ship_mode}</td>
                          <td className="py-1.5 px-3 font-semibold text-sky-400">{s.operational_lead_time_days}d</td>
                          <td className="py-1.5 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.is_delayed ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {s.is_delayed ? 'Breached' : 'On-Time'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
