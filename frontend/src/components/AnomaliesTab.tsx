import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert, Activity, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export const AnomaliesTab: React.FC = () => {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnomalies()
      .then(setAnomalies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Unsupervised Logistics Anomaly Detection</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Isolation Forest Logistics Outliers
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Detects multidimensional shipping anomalies where lead time diverges significantly from transit distance, order size, and carrier mode expectations.
          </p>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/30 px-4 py-2 rounded-xl text-center">
          <div className="text-lg font-bold text-rose-400">{anomalies.length}</div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Flagged Anomalies</div>
        </div>
      </div>

      {/* Difference Note: Anomaly Detection vs Delay Prediction */}
      <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-sky-400 font-semibold">Important Viva Distinction: </strong>
          <em>Delay Prediction</em> is a supervised classification model predicting whether an order will breach its SLA date threshold.
          <em>Anomaly Detection</em> is an unsupervised Isolation Forest model isolating statistically bizarre multi-attribute outlier patterns (e.g. Same Day orders taking 2 days over short distances or unusual weight-to-distance ratios).
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-3">Route Corridor</th>
                <th className="py-3 px-3">Carrier Mode</th>
                <th className="py-3 px-3">Op Lead Time</th>
                <th className="py-3 px-3">Expected Mode SLA</th>
                <th className="py-3 px-3">Anomaly Score</th>
                <th className="py-3 px-4">Deviation Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    <Activity className="w-5 h-5 animate-spin mx-auto text-sky-400 mb-1" />
                    Scanning dataset for multidimensional outliers...
                  </td>
                </tr>
              ) : anomalies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No anomalies flagged. All shipments within normal statistical parameters.
                  </td>
                </tr>
              ) : (
                anomalies.map((a) => (
                  <tr key={a.order_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {a.order_id}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-300">
                      {a.route_id}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {a.ship_mode}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-rose-400">
                      {a.operational_lead_time_days} days
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      ~{a.expected_lead_time_mode} days
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {a.anomaly_score}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={a.deviation_reason}>
                      {a.deviation_reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
