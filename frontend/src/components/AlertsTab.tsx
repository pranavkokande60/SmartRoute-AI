import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { api } from '../api';

export const AlertsTab: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = () => {
    api.getAlerts()
      .then(setAlerts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDismiss = async (id: number) => {
    try {
      await api.dismissAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-sky-400" />
            Automated Supply Chain Alerts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active warnings, route capacity bottlenecks, and SLA breach anomalies flagged by the detection engine.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
          {alerts.length} Active Notifications
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-xs text-slate-500 py-12 text-center">Loading operational alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">All Clear</h3>
            <p className="text-xs text-slate-400 mt-1">No active supply chain bottleneck alerts at this time.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';
            const isWarn = alert.severity === 'WARNING';
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  isCrit
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : (isWarn ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900 border-slate-800')
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCrit ? (
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCrit ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {alert.severity}
                      </span>
                      <h4 className="text-xs font-bold text-white">{alert.title}</h4>
                    </div>
                    <p className="text-xs text-slate-300">{alert.message}</p>
                    {alert.route_id && (
                      <span className="text-[10px] font-mono text-slate-400 mt-1.5 block">
                        Corridor: {alert.route_id}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                  title="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
