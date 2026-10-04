import React, { useEffect, useState } from 'react';
import { TrendingUp, Calendar, Activity, Info, BarChart2 } from 'lucide-react';
import { api } from '../api';

export const ForecastTab: React.FC = () => {
  const [forecastData, setForecastData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getForecasts()
      .then(setForecastData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Time-Series Logistics Projections</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            14-Day Nationwide Shipment Volume Forecast
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Statistical time-series forecasting integrating 7-day and 14-day rolling trends with weekday seasonality adjustments and 95% confidence intervals.
          </p>
        </div>

        <div className="bg-sky-500/10 border border-sky-500/30 px-4 py-2 rounded-xl text-center">
          <div className="text-lg font-bold text-sky-400">
            {forecastData?.historical_mean_daily || '14.0'} / day
          </div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Daily Mean Volume</div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          <Activity className="w-5 h-5 animate-spin mx-auto text-sky-400 mb-2" />
          Calculating time series projections...
        </div>
      ) : forecastData ? (
        <div className="space-y-6">
          {/* Projections Visual Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">14-Day Forward Projections</h3>
                <p className="text-[11px] text-slate-400">Estimated daily dispatches with lower and upper confidence bounds</p>
              </div>
              <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">
                Horizon: 14 Days
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Forecast Date</th>
                    <th className="py-2.5 px-3">Day of Week</th>
                    <th className="py-2.5 px-3">Projected Shipments</th>
                    <th className="py-2.5 px-3">Lower Bound (95%)</th>
                    <th className="py-2.5 px-3">Upper Bound (95%)</th>
                    <th className="py-2.5 px-4">Visual Band</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {forecastData.forecast_projections?.map((fp: any) => {
                    const maxBound = 30;
                    const pct = Math.min(100, Math.round((fp.projected_shipments / maxBound) * 100));
                    return (
                      <tr key={fp.date} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-semibold text-slate-200">{fp.date}</td>
                        <td className="py-2.5 px-3 text-slate-400 font-medium">{fp.day_name}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-sky-400 font-mono text-sm">
                            {fp.projected_shipments}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{fp.confidence_lower}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{fp.confidence_upper}</td>
                        <td className="py-2.5 px-4">
                          <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Baseline Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400" />
              <span>Model Formulation: Moving average baseline with empirical day-of-week seasonality weightings.</span>
            </div>
            <span className="font-mono text-slate-300">Confidence interval: ±1.96 standard errors</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
