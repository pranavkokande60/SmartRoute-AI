import React, { useState } from 'react';
import {
  FlaskConical, Sparkles, Clock, AlertTriangle, ShieldCheck,
  CheckCircle2, ArrowRight, Gauge, Info, RotateCcw,
  MapPin, Factory, Truck, Calendar, Layers, ShieldAlert,
  Zap, HelpCircle
} from 'lucide-react';
import { api } from '../api';

export const PredictionPlaygroundTab: React.FC = () => {
  const [productName, setProductName] = useState("Wonka Bar - Milk Chocolate");
  const [units, setUnits] = useState(6);
  const [stateProvince, setStateProvince] = useState("California");
  const [region, setRegion] = useState("Pacific");
  const [shipMode, setShipMode] = useState("Standard Class");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [customFactory, setCustomFactory] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const products = [
    { name: "Wonka Bar - Milk Chocolate", factory: "Wicked Choccy's", division: "Chocolate" },
    { name: "Wonka Bar - Triple Dazzle Caramel", factory: "Wicked Choccy's", division: "Chocolate" },
    { name: "Wonka Bar - Nutty Crunch Surprise", factory: "Wicked Choccy's", division: "Chocolate" },
    { name: "Wonka Bar - Fudge Mallows", factory: "Wicked Choccy's", division: "Chocolate" },
    { name: "Wonka Bar -Scrumdiddlyumptious", factory: "Wicked Choccy's", division: "Chocolate" },
    { name: "Wonka Gum", factory: "Sugar Shack", division: "Sugar" },
    { name: "Lickable Wallpaper", factory: "Sugar Shack", division: "Sugar" },
    { name: "Everlasting Gobstopper", factory: "The Other Factory", division: "Sugar" },
    { name: "Kazookles", factory: "Secret Factory", division: "Other" },
    { name: "Hair Toffee", factory: "Lot's O' Nuts", division: "Other" },
    { name: "Laffy Taffy", factory: "Sugar Shack", division: "Sugar" },
    { name: "SweeTARTS", factory: "Sugar Shack", division: "Sugar" }
  ];

  const statesWithRegion: { [state: string]: string } = {
    "Alabama": "Gulf", "Alaska": "Pacific", "Arizona": "West", "Arkansas": "South", "California": "Pacific",
    "Colorado": "West", "Connecticut": "East", "Delaware": "East", "Florida": "East", "Georgia": "East",
    "Hawaii": "Pacific", "Idaho": "West", "Illinois": "Midwest", "Indiana": "Midwest", "Iowa": "Midwest",
    "Kansas": "Midwest", "Kentucky": "Midwest", "Louisiana": "Gulf", "Maine": "East", "Maryland": "East",
    "Massachusetts": "East", "Michigan": "Midwest", "Minnesota": "Midwest", "Mississippi": "Gulf", "Missouri": "Midwest",
    "Montana": "West", "Nebraska": "Midwest", "Nevada": "West", "New Hampshire": "East", "New Jersey": "East",
    "New Mexico": "West", "New York": "East", "North Carolina": "East", "North Dakota": "Midwest", "Ohio": "Midwest",
    "Oklahoma": "South", "Oregon": "Pacific", "Pennsylvania": "East", "Rhode Island": "East", "South Carolina": "East",
    "South Dakota": "Midwest", "Tennessee": "South", "Texas": "South", "Utah": "West", "Vermont": "East",
    "Virginia": "East", "Washington": "Pacific", "West Virginia": "East", "Wisconsin": "Midwest", "Wyoming": "West"
  };

  const currentProductMeta = products.find(p => p.name === productName);
  const autoFactory = currentProductMeta ? currentProductMeta.factory : "Lot's O' Nuts";

  const handleStateChange = (selectedState: string) => {
    setStateProvince(selectedState);
    if (statesWithRegion[selectedState]) {
      setRegion(statesWithRegion[selectedState]);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.runPlaygroundPrediction({
        product_name: productName,
        units: Number(units),
        state_province: stateProvince,
        region: region,
        ship_mode: shipMode,
        order_date: orderDate,
        factory_name: customFactory || undefined
      });
      setPrediction(res);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to generate simulation prediction.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: {
    product: string;
    units: number;
    state: string;
    mode: string;
  }) => {
    setProductName(preset.product);
    setUnits(preset.units);
    handleStateChange(preset.state);
    setShipMode(preset.mode);
    setCustomFactory("");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-400" />
            AI Prediction Playground
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test and simulate ML models under arbitrary logistics conditions without creating real customer orders or altering database metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero-Persistence Sandbox Mode</span>
        </div>
      </div>

      {/* Preset Quick Scenarios */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Quick Scenario Presets</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleApplyPreset({
              product: "Wonka Bar - Milk Chocolate",
              units: 12,
              state: "California",
              mode: "Same Day"
            })}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left transition-all group"
          >
            <span className="text-xs font-semibold text-slate-200 group-hover:text-sky-400 block">
              ⚡ High-Priority West Coast Rush
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              12 Units • Same Day • California
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset({
              product: "Everlasting Gobstopper",
              units: 4,
              state: "Texas",
              mode: "Standard Class"
            })}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left transition-all group"
          >
            <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 block">
              📦 Long-Haul Standard Class
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              4 Units • Standard Class • Texas
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset({
              product: "Wonka Gum",
              units: 25,
              state: "New York",
              mode: "First Class"
            })}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left transition-all group"
          >
            <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 block">
              🏭 High-Volume Bulk Dispatch
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              25 Units • First Class • New York
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Playground Parameter Form */}
        <form onSubmit={handlePredict} className="md:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Gauge className="w-4 h-4 text-indigo-400" />
              <span>Simulated Order Attributes</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">In-Memory</span>
          </div>

          {/* Product Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product Catalog</label>
            <select
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {products.map((p) => (
                <option key={p.name} value={p.name}>{p.name} ({p.division})</option>
              ))}
            </select>
          </div>

          {/* Auto Factory Notice */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4 text-sky-400" />
              <span className="text-slate-400">Assigned Factory:</span>
            </div>
            <strong className="text-sky-300">{autoFactory}</strong>
          </div>

          {/* Quantity Units */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Order Quantity (Units)</span>
              <span className="text-indigo-400 font-bold">{units} units</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={units}
              onChange={(e) => setUnits(parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* State / Destination */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Destination State</label>
              <select
                value={stateProvince}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {Object.keys(statesWithRegion).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Geographic Region</label>
              <input
                type="text"
                readOnly
                value={region}
                className="w-full bg-slate-950/60 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Ship Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Carrier Shipping Mode</label>
            <select
              value={shipMode}
              onChange={(e) => setShipMode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Same Day">Same Day (SLA: 1 day)</option>
              <option value="First Class">First Class (SLA: 3 days)</option>
              <option value="Second Class">Second Class (SLA: 5 days)</option>
              <option value="Standard Class">Standard Class (SLA: 5 days)</option>
            </select>
          </div>

          {/* Order Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Order Placement Date</label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Simulating ML Inference...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Simulate AI Prediction</span>
              </>
            )}
          </button>
        </form>

        {/* Prediction Results Area */}
        <div className="md:col-span-7 space-y-4">
          {/* Explicit Prominent Disclaimer Required by Specification */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                AI PREDICTION — NOT AN ACTUAL SHIPMENT
              </div>
              <p className="text-xs text-indigo-200/80 mt-1">
                This playground provides in-memory testing for machine learning models. Predictions generated here are not recorded in the database and do not modify historical shipment data, live order queues, or KPI metrics.
              </p>
            </div>
          </div>

          {prediction ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* ETA & Risk KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Lead Time Card */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-medium">Estimated Lead Time</span>
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-white flex items-baseline gap-1.5 font-mono">
                    <span>{prediction.estimated_lead_time_days}</span>
                    <span className="text-xs font-medium text-slate-400">days</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Expected Range: <strong className="text-emerald-400">{prediction.expected_range_days}</strong>
                  </div>
                </div>

                {/* Delay Risk Card */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-medium">Delay Risk Level</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xl font-bold text-white flex items-baseline gap-1.5 mt-1">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      prediction.delay_risk === 'High Risk'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : (prediction.delay_risk === 'Moderate Risk'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40')
                    }`}>
                      {prediction.delay_risk}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Breach Probability: <strong className="text-slate-200">{prediction.delay_probability_pct}%</strong>
                  </div>
                </div>

                {/* Model Confidence Card */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-[11px] font-medium">Model Confidence</span>
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-3xl font-bold text-sky-400 flex items-baseline gap-1.5 font-mono">
                    <span>{prediction.confidence_score_pct}%</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Ensemble certainty level
                  </div>
                </div>
              </div>

              {/* Corridor Route Details */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    Simulated Route Corridor
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{prediction.route_id}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-850 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Origin Facility</span>
                    <strong className="text-white truncate block">{prediction.factory_name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Destination</span>
                    <strong className="text-white truncate block">{prediction.destination}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Transit Distance</span>
                    <strong className="text-sky-400 font-mono">{prediction.route_distance_miles} mi</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Expected Delay</span>
                    <strong className={prediction.is_delayed_expected ? "text-rose-400" : "text-emerald-400"}>
                      {prediction.is_delayed_expected ? "Yes (Breach)" : "No (On-Time)"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Explainable AI Factor Attribution */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Factor Attribution for This Prediction</span>
                </div>
                <p className="text-xs text-slate-400">
                  Directional influence of selected shipping mode, distance, and quantity on predicted outcomes:
                </p>

                <div className="space-y-2">
                  {prediction.explanation_factors?.map((f: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        <span className="font-semibold text-slate-200">{f.factor}</span>
                      </div>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        f.direction?.includes('increase') ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {f.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-500">
              <FlaskConical className="w-10 h-10 text-slate-700 mb-3" />
              <h3 className="font-semibold text-sm text-slate-400">Ready for Simulation</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Select a scenario preset above or configure parameters on the left to run an in-memory simulation test.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
