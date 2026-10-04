import React, { useState, useEffect } from 'react';
import {
  Cpu, Sparkles, Clock, AlertTriangle, ShieldCheck,
  CheckCircle2, ArrowRight, Gauge, Info, Activity,
  RefreshCw, TrendingUp, BarChart3, AlertOctagon,
  Sliders, Layers, FileText, Check
} from 'lucide-react';
import { api } from '../api';

export const PredictionTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'monitoring' | 'inference'>('monitoring');

  // Model Monitoring State
  const [monitoringData, setMonitoringData] = useState<any | null>(null);
  const [loadingMonitoring, setLoadingMonitoring] = useState(false);

  // Inference State
  const [factory, setFactory] = useState("Wicked Choccy's");
  const [destinationState, setDestinationState] = useState("California");
  const [shipMode, setShipMode] = useState("Standard Class");
  const [productName, setProductName] = useState("Wonka Bar - Milk Chocolate");
  const [units, setUnits] = useState(5);
  const [loadingInference, setLoadingInference] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any | null>(null);

  const fetchMonitoring = async () => {
    setLoadingMonitoring(true);
    try {
      const data = await api.getModelMonitoring();
      setMonitoringData(data);
    } catch (err) {
      console.error('Failed to load model monitoring data:', err);
    } finally {
      setLoadingMonitoring(false);
    }
  };

  useEffect(() => {
    fetchMonitoring();
  }, []);

  const factories = [
    "Lot's O' Nuts",
    "Wicked Choccy's",
    "Sugar Shack",
    "Secret Factory",
    "The Other Factory"
  ];

  const popularStates = [
    "California", "New York", "Texas", "Florida", "Illinois",
    "Washington", "Pennsylvania", "Ohio", "Georgia", "North Carolina"
  ];

  const products = [
    "Wonka Bar - Milk Chocolate",
    "Wonka Bar - Triple Dazzle Caramel",
    "Wonka Bar - Nutty Crunch Surprise",
    "Wonka Bar - Fudge Mallows",
    "Wonka Bar -Scrumdiddlyumptious",
    "Wonka Gum",
    "Lickable Wallpaper",
    "Everlasting Gobstopper",
    "Kazookles",
    "Hair Toffee",
    "Laffy Taffy",
    "SweeTARTS"
  ];

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingInference(true);
    try {
      const payload = {
        factory_name: factory,
        "State/Province": destinationState,
        Region: "Pacific",
        "Ship Mode": shipMode,
        Division: "Chocolate",
        "Product Name": productName,
        Units: units,
        Sales: units * 3.25,
        route_distance_miles: 1850.0,
        order_month: 6,
        unit_price: 3.25
      };
      const res = await api.predict(payload);
      setPredictionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInference(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            ML Model Center & Performance Monitoring
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous model observability, production drift detection, and explainable AI inference for deployed logistics models.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('monitoring')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'monitoring'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Model Monitoring</span>
            {monitoringData?.system_status === 'DEGRADED' && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('inference')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'inference'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inference & Explainability</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: MODEL PERFORMANCE MONITORING                    */}
      {/* ======================================================== */}
      {activeSubTab === 'monitoring' && (
        <div className="space-y-6">
          {/* System Observability Summary Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-xl border ${
                monitoringData?.system_status === 'DEGRADED'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : (monitoringData?.system_status === 'WARNING'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400')
              }`}>
                {monitoringData?.system_status === 'DEGRADED' ? (
                  <AlertOctagon className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Production Model Fleet Observability</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                    monitoringData?.system_status === 'DEGRADED'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : (monitoringData?.system_status === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40')
                  }`}>
                    Fleet Status: {monitoringData?.system_status || 'OPTIMAL'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Active monitoring across 4 production machine learning models. Live evaluation requires real delivery outcomes to compute drift accurately without speculative assumptions.
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-slate-400">
                  <span>Models Deployed: <strong className="text-white">{monitoringData?.total_models_monitored || 4}</strong></span>
                  <span>•</span>
                  <span>Evaluated Real Outcomes: <strong className="text-sky-400">{monitoringData?.evaluated_outcomes_count || 0}</strong></span>
                  <span>•</span>
                  <span>Last Evaluation: <strong className="text-slate-300">{monitoringData?.last_system_evaluation || 'N/A'}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={fetchMonitoring}
              disabled={loadingMonitoring}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMonitoring ? 'animate-spin' : ''}`} />
              <span>Refresh Fleet Status</span>
            </button>
          </div>

          {/* Degradation Warning Notification (if any model degraded) */}
          {monitoringData?.models?.some((m: any) => m.degradation_warning) && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  Model Performance Degradation Alert
                </h4>
                {monitoringData.models
                  .filter((m: any) => m.degradation_warning)
                  .map((m: any) => (
                    <p key={m.model_id} className="text-xs text-rose-200/90 mt-1">
                      <strong>{m.model_name}:</strong> {m.degradation_warning}
                    </p>
                  ))}
                <p className="text-[11px] text-rose-300/70 mt-1">
                  Degradation threshold is strictly calculated based on {monitoringData?.thresholds?.min_samples_required || 5}+ real delivery outcomes. Insufficient data never triggers false degradation alerts.
                </p>
              </div>
            </div>
          )}

          {/* Deployed Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {monitoringData?.models?.map((model: any) => {
              const isDegraded = model.status === 'DEGRADED';
              const isWarning = model.status === 'WARNING';
              const isCollecting = model.status === 'COLLECTING_DATA';
              const isHealthy = model.status === 'HEALTHY';

              return (
                <div
                  key={model.model_id}
                  className={`bg-slate-900 border rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden transition-all ${
                    isDegraded
                      ? 'border-rose-500/40 shadow-rose-950/20'
                      : (isWarning
                        ? 'border-amber-500/40 shadow-amber-950/20'
                        : 'border-slate-800 hover:border-slate-750')
                  }`}
                >
                  {/* Model Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">{model.model_name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {model.version}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{model.model_type}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                      isDegraded
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : (isWarning
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : (isCollecting
                            ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'))
                    }`}>
                      {model.status}
                    </span>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-850 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Training Date</span>
                      <strong className="text-slate-300 font-mono">{model.training_date}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Predictions</span>
                      <strong className="text-slate-300 font-mono">{model.total_predictions_served?.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Evaluated</span>
                      <strong className="text-sky-400 font-mono">{model.evaluated_samples_count} outcomes</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Last Evaluation</span>
                      <strong className="text-slate-300 font-mono text-[10px] truncate block">{model.last_evaluation_date || 'Awaiting Data'}</strong>
                    </div>
                  </div>

                  {/* Performance Metrics: Baseline vs Production Real */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Live Production Performance</span>
                      <span className="text-[10px] text-slate-500">Benchmark vs Live</span>
                    </div>

                    {/* ETA Model Metrics */}
                    {model.model_id === 'eta_regressor' && (
                      <div className="space-y-2">
                        {isCollecting ? (
                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                            {model.current_metrics?.status_note}
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                              <span className="text-[10px] text-slate-500 block">MAE (Lead Time)</span>
                              <div className="text-base font-bold text-white font-mono flex items-baseline gap-1">
                                <span>{model.current_metrics?.mae}</span>
                                <span className="text-[10px] text-slate-400">d</span>
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                Base: {model.baseline_metrics?.mae_days}d
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                              <span className="text-[10px] text-slate-500 block">RMSE</span>
                              <div className="text-base font-bold text-white font-mono flex items-baseline gap-1">
                                <span>{model.current_metrics?.rmse}</span>
                                <span className="text-[10px] text-slate-400">d</span>
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                Base: {model.baseline_metrics?.rmse_days}d
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                              <span className="text-[10px] text-slate-500 block">R² Score</span>
                              <div className="text-base font-bold text-sky-400 font-mono">
                                {model.current_metrics?.r2_score !== undefined ? model.current_metrics.r2_score : 'N/A'}
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                Base: {model.baseline_metrics?.r2_score}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Delay Model Metrics */}
                    {model.model_id === 'delay_classifier' && (
                      <div className="space-y-2">
                        {isCollecting ? (
                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                            {model.current_metrics?.status_note}
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-4 gap-2">
                              <div className="p-2 rounded-xl bg-slate-950 border border-slate-850 text-center">
                                <span className="text-[10px] text-slate-500 block">Accuracy</span>
                                <span className="text-xs font-bold text-white font-mono">
                                  {Math.round((model.current_metrics?.accuracy || 0) * 100)}%
                                </span>
                              </div>
                              <div className="p-2 rounded-xl bg-slate-950 border border-slate-850 text-center">
                                <span className="text-[10px] text-slate-500 block">Precision</span>
                                <span className="text-xs font-bold text-emerald-400 font-mono">
                                  {model.current_metrics?.precision}
                                </span>
                              </div>
                              <div className="p-2 rounded-xl bg-slate-950 border border-slate-850 text-center">
                                <span className="text-[10px] text-slate-500 block">Recall</span>
                                <span className="text-xs font-bold text-sky-400 font-mono">
                                  {model.current_metrics?.recall}
                                </span>
                              </div>
                              <div className="p-2 rounded-xl bg-slate-950 border border-slate-850 text-center">
                                <span className="text-[10px] text-slate-500 block">F1-Score</span>
                                <span className={`text-xs font-bold font-mono ${
                                  model.current_metrics?.f1_score < 0.4 ? 'text-rose-400' : 'text-amber-400'
                                }`}>
                                  {model.current_metrics?.f1_score}
                                </span>
                              </div>
                            </div>

                            {/* Confusion Matrix Mini Visualizer */}
                            {model.current_metrics?.confusion_matrix && (
                              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                                <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
                                  <span>Live Confusion Matrix</span>
                                  <span className="text-[10px] text-slate-500 font-mono">N={model.evaluated_samples_count}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 text-center text-xs">
                                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-1.5 rounded-lg">
                                    <span className="text-[10px] text-emerald-400 block font-semibold">TP (Delayed)</span>
                                    <span className="font-bold text-white">{model.current_metrics.confusion_matrix.tp}</span>
                                  </div>
                                  <div className="bg-amber-500/10 border border-amber-500/20 p-1.5 rounded-lg">
                                    <span className="text-[10px] text-amber-400 block font-semibold">FP (False Alarm)</span>
                                    <span className="font-bold text-white">{model.current_metrics.confusion_matrix.fp}</span>
                                  </div>
                                  <div className="bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-lg">
                                    <span className="text-[10px] text-rose-400 block font-semibold">FN (Missed Delay)</span>
                                    <span className="font-bold text-white">{model.current_metrics.confusion_matrix.fn}</span>
                                  </div>
                                  <div className="bg-sky-500/10 border border-sky-500/20 p-1.5 rounded-lg">
                                    <span className="text-[10px] text-sky-400 block font-semibold">TN (On-Time)</span>
                                    <span className="font-bold text-white">{model.current_metrics.confusion_matrix.tn}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Anomaly Detection Metrics */}
                    {model.model_id === 'anomaly_detector' && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Contamination Rate:</span>
                          <strong className="text-white font-mono">{model.baseline_metrics?.contamination_rate} (2%)</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Flagged Anomalies:</span>
                          <strong className="text-amber-400 font-mono">{model.baseline_metrics?.historical_anomalies_flagged} outliers</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>False Positive Escalations:</span>
                          <strong className="text-emerald-400 font-mono">0 reported</strong>
                        </div>
                      </div>
                    )}

                    {/* Volume Forecasting Metrics */}
                    {model.model_id === 'volume_forecaster' && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Forecast Horizon:</span>
                          <strong className="text-white font-mono">{model.baseline_metrics?.horizon_days} Days Forward</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Forecast Error (MAPE):</span>
                          <strong className="text-emerald-400 font-mono">{model.baseline_metrics?.mape_pct}%</strong>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Confidence Coverage:</span>
                          <strong className="text-sky-400 font-mono">{model.baseline_metrics?.confidence_coverage_pct}% (95% CI)</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Degradation Warning footer inside card */}
                  {model.degradation_warning && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{model.degradation_warning}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Monitoring Rules & Governance Guide */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Production Monitoring & Degradation Policy
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
                <strong className="text-slate-200 block mb-1">1. Minimum Evaluation Quorum</strong>
                A minimum of 5 real-world delivered orders must be evaluated before drift warnings are asserted. Insufficient sample sizes remain in <span className="text-sky-400 font-semibold">COLLECTING_DATA</span> state.
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
                <strong className="text-slate-200 block mb-1">2. Lead Time SLA Tolerance</strong>
                ETA Regressor triggers <span className="text-amber-400 font-semibold">WARNING</span> when MAE &gt; 1.8 days, and <span className="text-rose-400 font-semibold">DEGRADED</span> when MAE &gt; 2.5 days.
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850">
                <strong className="text-slate-200 block mb-1">3. Classification Drift</strong>
                Delay Classifier triggers <span className="text-rose-400 font-semibold">DEGRADED</span> when live F1-score falls below 0.400 across completed delivery cycles.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: INTERACTIVE INFERENCE & EXPLAINABILITY          */}
      {/* ======================================================== */}
      {activeSubTab === 'inference' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Input Parameters Form */}
          <form onSubmit={handlePredict} className="md:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
              <Gauge className="w-4 h-4 text-sky-400" />
              <span>Shipment Dispatch Parameters</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Origin Factory Facility</label>
              <select
                value={factory}
                onChange={(e) => setFactory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {factories.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Customer State</label>
              <select
                value={destinationState}
                onChange={(e) => setDestinationState(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {popularStates.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Carrier Shipping Mode</label>
              <select
                value={shipMode}
                onChange={(e) => setShipMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="Same Day">Same Day (SLA: 1 day)</option>
                <option value="First Class">First Class (SLA: 3 days)</option>
                <option value="Second Class">Second Class (SLA: 4 days)</option>
                <option value="Standard Class">Standard Class (SLA: 5 days)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Candy Product Line</label>
              <select
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                {products.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Order Quantity: <span className="text-sky-400 font-bold">{units} units</span>
              </label>
              <input
                type="range"
                min={1}
                max={14}
                value={units}
                onChange={(e) => setUnits(parseInt(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={loadingInference}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingInference ? (
                <span>Running ML Inference...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Intelligent Prediction</span>
                </>
              )}
            </button>
          </form>

          {/* Prediction Output & Explainability */}
          <div className="md:col-span-7 space-y-4">
            {predictionResult ? (
              <>
                {/* ETA & Delay Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {/* ETA Card */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-medium">Predicted Delivery ETA</span>
                      <Clock className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-bold text-white flex items-baseline gap-1.5">
                      <span>{predictionResult.eta_prediction?.predicted_lead_time_days}</span>
                      <span className="text-xs font-medium text-slate-400">days</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      Confidence Range: <strong className="text-emerald-400">{predictionResult.eta_prediction?.expected_range_days}</strong>
                    </div>
                  </div>

                  {/* Delay Risk Card */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-medium">SLA Breach Risk</span>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="text-3xl font-bold text-white flex items-baseline gap-1.5">
                      <span>{predictionResult.delay_prediction?.delay_percentage}%</span>
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        predictionResult.delay_prediction?.risk_level === 'High Risk'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : (predictionResult.delay_prediction?.risk_level === 'Moderate Risk'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30')
                      }`}>
                        {predictionResult.delay_prediction?.risk_level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Explainable AI Factors */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">
                    <Sparkles className="w-4 h-4" />
                    <span>Explainable AI — Feature Impact Attribution</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Why did the model predict this outcome? Below is the directional attribution of each input factor:
                  </p>

                  <div className="space-y-2.5">
                    {predictionResult.explainability?.top_factors?.map((f: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                          <span className="font-semibold text-slate-200">{f.factor}</span>
                        </div>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                          f.direction?.includes('increase') ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {f.impact}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Architecture: Random Forest Classifier + Regressor</span>
                    <span className="text-emerald-400">Zero Data Leakage Enforced</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full min-h-[320px] rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <Cpu className="w-10 h-10 text-slate-700 mb-3" />
                <h3 className="font-semibold text-sm text-slate-400">No Active Prediction</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Configure origin facility, destination state, ship mode, and product parameters on the left to run inference.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
