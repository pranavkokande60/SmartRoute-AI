import React, { useState, useEffect } from 'react';
import {
  BarChart3, CheckCircle2, AlertTriangle, Clock, ArrowRight,
  TrendingUp, RefreshCw, X, ShieldAlert, Award, FileCheck2,
  Calendar, Layers, Sparkles
} from 'lucide-react';
import { api } from '../api';

export const PredictionPerformanceTab: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluatingOrder, setEvaluatingOrder] = useState<any | null>(null);
  const [actualLeadTime, setActualLeadTime] = useState<number>(4);
  const [actualDeliveryDate, setActualDeliveryDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [evalNotes, setEvalNotes] = useState<string>('');
  const [submittingEval, setSubmittingEval] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const res = await api.getPredictionPerformance();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load prediction performance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const handleOpenEvaluateModal = (order: any) => {
    setEvaluatingOrder(order);
    setActualLeadTime(Math.round(order.predicted_lead_time_days || 4));
    setActualDeliveryDate(new Date().toISOString().slice(0, 10));
    setEvalNotes('');
    setErrorMsg(null);
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingOrder) return;

    setSubmittingEval(true);
    setErrorMsg(null);
    try {
      await api.evaluatePrediction(evaluatingOrder.id, {
        actual_delivery_date: actualDeliveryDate,
        actual_lead_time_days: Number(actualLeadTime),
        notes: evalNotes
      });
      setEvaluatingOrder(null);
      await fetchPerformance();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to record actual delivery outcome.');
    } finally {
      setSubmittingEval(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>AI Model Validation</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            📊 Prediction Performance — Predicted vs Actual Outcomes
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Empirical evaluation comparing machine learning predicted delivery lead times and delay risks against real-world delivery results for completed orders.
          </p>
        </div>

        <button
          onClick={fetchPerformance}
          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all flex items-center gap-2 text-xs font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Logical Boundary Callout */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <FileCheck2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-sky-400">Strict Scientific Integrity: </strong>
          Predictions are strictly separated from actual delivery outcomes. Performance statistics (MAE, RMSE, Confusion Matrix) are computed <em>only</em> on completed orders with confirmed delivery information. No synthetic outcomes are fabricated.
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Evaluated Orders</span>
          <div className="text-2xl font-bold text-white mt-1">
            {data?.total_evaluated_orders || 0}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Confirmed deliveries</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-400">MAE (Lead Time)</span>
          <div className="text-2xl font-bold text-sky-400 mt-1">
            {data?.mae !== undefined ? `${data.mae}d` : '0.0d'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Mean Absolute Error</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-400">RMSE</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {data?.rmse !== undefined ? `${data.rmse}d` : '0.0d'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Root Mean Squared</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Prediction Bias</span>
          <div className={`text-2xl font-bold mt-1 ${data?.avg_prediction_error > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {data?.avg_prediction_error !== undefined ? `${data.avg_prediction_error > 0 ? '+' : ''}${data.avg_prediction_error}d` : '0.0d'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Avg Error (Pred - Act)</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Lead Time Accuracy</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {data?.lead_time_accuracy_pct !== undefined ? `${data.lead_time_accuracy_pct}%` : '0%'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Within &plusmn;1.0 day</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Delay F1-Score</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {data?.f1_score !== undefined ? data.f1_score : '0.0'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Precision: {data?.precision || 0}</span>
        </div>
      </div>

      {/* Delay Classification Confusion Matrix & Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Confusion Matrix Visual */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-sky-400" />
            Delay Classification Confusion Matrix
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Evaluates delay risk predictions vs confirmed SLA delivery status.
          </p>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">True Negative (TN)</span>
              <div className="text-2xl font-black text-emerald-300 mt-1">
                {data?.confusion_matrix?.tn || 0}
              </div>
              <span className="text-[10px] text-slate-400">Predicted On-Time & Was On-Time</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-[10px] font-bold text-amber-400 uppercase">False Positive (FP)</span>
              <div className="text-2xl font-black text-amber-300 mt-1">
                {data?.confusion_matrix?.fp || 0}
              </div>
              <span className="text-[10px] text-slate-400">Predicted Delayed & Was On-Time</span>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <span className="text-[10px] font-bold text-rose-400 uppercase">False Negative (FN)</span>
              <div className="text-2xl font-black text-rose-300 mt-1">
                {data?.confusion_matrix?.fn || 0}
              </div>
              <span className="text-[10px] text-slate-400">Predicted On-Time & Was Delayed</span>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30">
              <span className="text-[10px] font-bold text-sky-400 uppercase">True Positive (TP)</span>
              <div className="text-2xl font-black text-sky-300 mt-1">
                {data?.confusion_matrix?.tp || 0}
              </div>
              <span className="text-[10px] text-slate-400">Predicted Delayed & Was Delayed</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Precision (Positive Predictive Value):</span>
              <span className="font-mono font-bold text-white">{data?.precision || 0}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Recall (Sensitivity / Detection Rate):</span>
              <span className="font-mono font-bold text-white">{data?.recall || 0}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Overall Accuracy:</span>
              <span className="font-mono font-bold text-emerald-400">{data?.classification_accuracy ? `${Math.round(data.classification_accuracy * 100)}%` : '0%'}</span>
            </div>
          </div>
        </div>

        {/* Evaluated Orders Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Evaluated Orders (Predicted vs Actual)
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                {data?.total_evaluated_orders || 0} completed shipments
              </span>
            </div>

            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-2">Carrier Mode</th>
                    <th className="py-2.5 px-2">Pred ETA</th>
                    <th className="py-2.5 px-2">Actual</th>
                    <th className="py-2.5 px-2">Error</th>
                    <th className="py-2.5 px-2">Delay Pred</th>
                    <th className="py-2.5 px-2">Actual Status</th>
                    <th className="py-2.5 px-3">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data?.evaluated_orders?.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No evaluated orders recorded yet. Use the table below to record delivery outcomes.
                      </td>
                    </tr>
                  ) : (
                    data?.evaluated_orders?.map((o: any) => (
                      <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-sky-400">
                          {o.order_id}
                          <div className="text-[10px] text-slate-500 font-sans">{o.destination}</div>
                        </td>
                        <td className="py-2.5 px-2 text-slate-300">{o.ship_mode}</td>
                        <td className="py-2.5 px-2 font-mono font-semibold text-slate-200">{o.predicted_lead_time_days}d</td>
                        <td className="py-2.5 px-2 font-mono font-bold text-white">{o.actual_lead_time_days}d</td>
                        <td className="py-2.5 px-2">
                          <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                            o.absolute_error_days <= 1.0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                          }`}>
                            {o.prediction_error_days > 0 ? `+${o.prediction_error_days}d` : `${o.prediction_error_days}d`}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-[11px]">{o.predicted_delay_risk}</td>
                        <td className="py-2.5 px-2">
                          {o.actual_is_delayed ? (
                            <span className="text-rose-400 font-semibold text-[10px]">Delayed</span>
                          ) : (
                            <span className="text-emerald-400 font-semibold text-[10px]">On-Time</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-300">
                            {o.delay_prediction_outcome}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Awaiting Delivery Outcomes Section */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Active Orders Awaiting Actual Delivery Outcome
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              These orders have live AI predictions active. Click "Record Delivery Outcome" once actual package arrival is confirmed to update the model accuracy metrics.
            </p>
          </div>
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-lg text-xs font-mono font-bold">
            {data?.total_awaiting_orders || 0} In-Transit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Order ID</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Factory Origin</th>
                <th className="py-2.5 px-3">Destination</th>
                <th className="py-2.5 px-3">Carrier Mode</th>
                <th className="py-2.5 px-3">Predicted ETA</th>
                <th className="py-2.5 px-3">Delay Risk</th>
                <th className="py-2.5 px-3">Current Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.awaiting_orders?.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No active orders currently awaiting delivery evaluation. Create an order in "New Order Management" to test.
                  </td>
                </tr>
              ) : (
                data?.awaiting_orders?.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-sky-400">{o.order_id}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-medium">{o.product_name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{o.factory_name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{o.destination}</td>
                    <td className="py-2.5 px-3 text-slate-400">{o.ship_mode}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-300">{o.predicted_lead_time_days} days</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.delay_risk === 'High Risk' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                        o.delay_risk === 'Moderate Risk' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {o.delay_risk}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 text-slate-300 border border-slate-800">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEvaluateModal(o)}
                        className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-[11px] transition-all shadow-sm shadow-sky-500/20"
                      >
                        Record Delivery
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Actual Delivery Modal */}
      {evaluatingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setEvaluatingOrder(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Evaluation Intake</span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              Record Actual Delivery Outcome
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter the confirmed delivery outcome for order <strong className="text-sky-300 font-mono">{evaluatingOrder.order_id}</strong> to calculate prediction error and update ML metrics.
            </p>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Prediction baseline card */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500">AI Predicted ETA</span>
                <div className="text-base font-bold text-sky-400 mt-0.5">{evaluatingOrder.predicted_lead_time_days} days</div>
                <div className="text-[10px] text-slate-400">Carrier: {evaluatingOrder.ship_mode}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Predicted Delay Risk</span>
                <div className="text-sm font-semibold text-slate-200 mt-0.5">{evaluatingOrder.delay_risk}</div>
                <div className="text-[10px] text-slate-400">Destination: {evaluatingOrder.destination}</div>
              </div>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Actual Lead Time (Days from Order to Delivery) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="30"
                  value={actualLeadTime}
                  onChange={(e) => setActualLeadTime(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-sky-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Expected SLA for {evaluatingOrder.ship_mode}: {
                    evaluatingOrder.ship_mode === 'Same Day' ? '1 day' :
                    evaluatingOrder.ship_mode === 'First Class' ? '3 days' : '5 days'
                  }
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Actual Delivery Date *
                </label>
                <input
                  type="date"
                  required
                  value={actualDeliveryDate}
                  onChange={(e) => setActualDeliveryDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Evaluation / Delivery Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Delivered on time without damage, weather delay noted..."
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEvaluatingOrder(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEval}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {submittingEval ? 'Recording...' : 'Record Outcome & Calculate Error'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
