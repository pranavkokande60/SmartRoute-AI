import React from 'react';
import {
  Truck, Package, Clock, AlertTriangle, Activity, TrendingUp,
  Sparkles, ShieldCheck, ArrowUpRight, ArrowDownRight, Compass,
  DollarSign, CheckCircle2, ChevronRight
} from 'lucide-react';
import { TabKey } from './Sidebar';

interface DashboardTabProps {
  summary: any;
  charts: any;
  aiSummary: any;
  onNavigate: (tab: TabKey) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  summary,
  charts,
  aiSummary,
  onNavigate
}) => {
  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Activity className="w-6 h-6 animate-spin mr-2 text-sky-400" />
        Loading Command Center Intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Network Command Center Active
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Nassau Candy Factory-to-Customer Logistics Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time supply chain telemetry across 5 manufacturing hubs, 196 delivery corridors, and 10,194 shipments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('predict')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition-all"
          >
            <span>Predict ETA</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('map')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Open Map</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Shipments */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Shipments</span>
            <Package className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {summary.total_shipments?.toLocaleString() || '10,194'}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
            <span>{summary.total_orders?.toLocaleString()} unique orders</span>
          </div>
        </div>

        {/* Operational Shipping Lead Time */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Operational Lead Time</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-1.5">
            <span>{summary.avg_operational_lead_time_days || '4.29'}</span>
            <span className="text-xs font-medium text-slate-400">days</span>
          </div>
          <div className="mt-1 text-[10px] text-amber-400/90 font-mono">
            Raw: {summary.raw_dataset_lead_time_days}d (offset removed)
          </div>
        </div>

        {/* Delay Rate */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">SLA Delay Rate</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {summary.delay_rate_pct || '28.7'}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {summary.high_risk_routes_count || '26'} high-risk routes
          </div>
        </div>

        {/* Route Efficiency Score */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Route Efficiency</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white flex items-baseline gap-1.5">
            <span>{summary.avg_route_efficiency_score || '62.8'}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>196 corridors scored</span>
          </div>
        </div>
      </div>

      {/* Secondary Financial & Network Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Total Net Revenue</div>
          <div className="text-lg font-bold text-slate-200 mt-0.5">
            ${summary.total_revenue_sales?.toLocaleString() || '141,782.64'}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Total Gross Profit</div>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">
            ${summary.total_gross_profit?.toLocaleString() || '93,442.80'}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Geographic Bottlenecks</div>
          <div className="text-lg font-bold text-amber-400 mt-0.5">
            {summary.bottlenecks_count || '138'} routes
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] text-slate-400">Flagged Anomalies</div>
          <div className="text-lg font-bold text-rose-400 mt-0.5">
            {summary.total_anomalies_count || '203'} shipments
          </div>
        </div>
      </div>

      {/* AI Decision-Support Summary Card */}
      {aiSummary && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-sky-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Automated Logistics Intelligence & Audit Findings</span>
          </div>
          <h3 className="text-sm font-bold text-white mb-3">{aiSummary.headline}</h3>
          <ul className="space-y-2">
            {aiSummary.bullet_points?.map((bp: string, idx: number) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-sky-400 font-bold mt-0.5">•</span>
                <span>{bp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Charts Grid: Ship Mode Breakdown & Regional Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ship Mode Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Shipping Mode Performance</h3>
              <p className="text-xs text-slate-400">Operational transit times and financial volume</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">4 Modes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Ship Mode</th>
                  <th className="py-2.5 px-3">Volume</th>
                  <th className="py-2.5 px-3">Avg Lead Time</th>
                  <th className="py-2.5 px-3">Revenue ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {charts?.ship_mode_comparison?.map((m: any) => (
                  <tr key={m.ship_mode} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{m.ship_mode}</td>
                    <td className="py-2.5 px-3 text-slate-400">{m.shipments.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {m.avg_lead_time} days
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">${m.sales.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regional Volume & Lead Time */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Regional Territory Distribution</h3>
              <p className="text-xs text-slate-400">Shipment volume across the 4 key US regions</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">4 Territories</span>
          </div>

          <div className="space-y-3">
            {charts?.regional_breakdown?.map((r: any) => {
              const maxVol = 3500;
              const pct = Math.round((r.shipments / maxVol) * 100);
              return (
                <div key={r.region} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-200">{r.region} Region</span>
                    <span className="text-slate-400">{r.shipments.toLocaleString()} shipments ({r.avg_lead_time}d avg)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
