import React, { useState } from 'react';
import { Sliders, Sparkles, ArrowRight, ShieldCheck, Clock, AlertTriangle, ArrowDown } from 'lucide-react';
import { api } from '../api';

export const SimulationTab: React.FC = () => {
  const [factory, setFactory] = useState("Wicked Choccy's");
  const [destinationState, setDestinationState] = useState("California");
  const [currentMode, setCurrentMode] = useState("Standard Class");
  const [targetMode, setTargetMode] = useState("First Class");
  const [productName, setProductName] = useState("Wonka Bar - Milk Chocolate");
  const [units, setUnits] = useState(10);
  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  const factories = ["Lot's O' Nuts", "Wicked Choccy's", "Sugar Shack", "Secret Factory", "The Other Factory"];
  const states = ["California", "New York", "Texas", "Florida", "Illinois", "Washington", "Pennsylvania", "Ohio"];
  const modes = ["Standard Class", "Second Class", "First Class", "Same Day"];

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.runSimulation({
        factory_name: factory,
        destination_state: destinationState,
        current_ship_mode: currentMode,
        target_ship_mode: targetMode,
        product_name: productName,
        units: units
      });
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-sky-400" />
          What-If Logistics Scenario Simulator
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Simulate carrier mode switches, estimate lead-time savings, and quantify SLA delay risk reductions before dispatching orders.
        </p>
      </div>

      {/* Simulator Inputs & Form */}
      <form onSubmit={handleSimulate} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Origin Factory</label>
            <select
              value={factory}
              onChange={(e) => setFactory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {factories.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Destination State</label>
            <select
              value={destinationState}
              onChange={(e) => setDestinationState(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Current Baseline Mode</label>
            <select
              value={currentMode}
              onChange={(e) => setCurrentMode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {modes.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-sky-400 mb-1">Proposed Alternative Mode</label>
            <select
              value={targetMode}
              onChange={(e) => setTargetMode(e.target.value)}
              className="w-full bg-slate-950 border border-sky-500/50 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {modes.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div className="text-xs text-slate-400">
            Simulating: <strong className="text-white">{factory}</strong> to <strong className="text-white">{destinationState}</strong> ({units} units)
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-600/20 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Evaluating Scenario...' : 'Execute What-If Simulation'}</span>
          </button>
        </div>
      </form>

      {/* Simulation Result Comparison */}
      {simResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Baseline Scenario */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Baseline Strategy</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                  {simResult.current_scenario?.ship_mode}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-slate-400">Estimated Operational Lead Time</span>
                  <div className="text-2xl font-bold text-white flex items-baseline gap-1 mt-0.5">
                    <span>{simResult.current_scenario?.predicted_lead_time_days}</span>
                    <span className="text-xs text-slate-500">days</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">SLA Breach Risk:</span>
                  <span className="font-bold text-rose-400">{simResult.current_scenario?.delay_probability_pct}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Risk Assessment:</span>
                  <span className="font-semibold text-slate-200">{simResult.current_scenario?.risk_level}</span>
                </div>
              </div>
            </div>

            {/* Proposed Optimized Scenario */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-sky-500/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Proposed Strategy</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {simResult.alternative_scenario?.ship_mode}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] text-slate-400">Estimated Operational Lead Time</span>
                  <div className="text-2xl font-bold text-emerald-400 flex items-baseline gap-1 mt-0.5">
                    <span>{simResult.alternative_scenario?.predicted_lead_time_days}</span>
                    <span className="text-xs text-slate-500">days</span>
                    {simResult.lead_time_reduction_days > 0 && (
                      <span className="text-xs text-emerald-400 font-normal ml-2 flex items-center">
                        <ArrowDown className="w-3 h-3 inline" /> {simResult.lead_time_reduction_days}d faster
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">SLA Breach Risk:</span>
                  <span className="font-bold text-emerald-400">{simResult.alternative_scenario?.delay_probability_pct}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Risk Assessment:</span>
                  <span className="font-semibold text-slate-200">{simResult.alternative_scenario?.risk_level}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Recommendation Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Simulated Strategy Recommendation</span>
            </div>
            <p className="text-slate-300">{simResult.executive_recommendation}</p>
            <p className="text-[10px] text-slate-500 mt-2">
              * Note: Estimates are generated from historical machine learning inference and represent statistical projections without guaranteeing carrier performance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
