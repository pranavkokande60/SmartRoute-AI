import React, { useEffect, useState } from 'react';
import { Database, FileText, Download, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { api } from '../api';

export const QualityTab: React.FC = () => {
  const [report, setReport] = useState<any | null>(null);

  useEffect(() => {
    api.getQualityReport()
      .then(setReport)
      .catch(console.error);
  }, []);

  const handleDownloadPdf = () => {
    window.open(api.getPdfReportUrl(), '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header with PDF Download Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Dataset Audit & Governance Passed</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Data Quality & Validation Report
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Non-destructive data engineering audit of Nassau Candy Distributor.csv with 5 explicit quality audit flags.
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-600/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download Executive PDF Report</span>
        </button>
      </div>

      {/* Dataset Core Audit Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Validated Records</span>
          <div className="text-2xl font-bold text-white mt-1">10,194</div>
          <span className="text-[10px] text-emerald-400 font-semibold">100% Complete (0 NULLs)</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Features & Flags</span>
          <div className="text-2xl font-bold text-white mt-1">35 Columns</div>
          <span className="text-[10px] text-sky-400 font-semibold">18 Raw + 17 Engineered</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Duplicate Rows</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">0 Duplicates</div>
          <span className="text-[10px] text-slate-400 font-semibold">Strictly unique records</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Accounting Accuracy</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">100.0%</div>
          <span className="text-[10px] text-slate-400 font-semibold">Sales = Cost + Profit</span>
        </div>
      </div>

      {/* The 5 Explicit Quality Audit Flags */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">5 Explicit Data Quality Audit Flags</h3>
            <p className="text-xs text-slate-400">Identified and addressed during preprocessing without altering original raw CSV</p>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Audit Complete
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Flag 1 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850">
            <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Flag 1: Artificial Multi-Year Lead Time Shift (flag_artificial_date_shift)</span>
              </div>
              <span className="text-rose-400 font-mono">10,194 records (100.0%)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Order Date was compressed into 2024–2025 while Ship Date was projected into 2026–2030, generating raw lead times of 904 to 1,642 days.
              <strong> Resolution:</strong> Resolved via empirical Same Day cohort anchoring without modifying the raw CSV, restoring realistic 0–11 day operational lead times.
            </p>
          </div>

          {/* Flag 2 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850">
            <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Flag 2: Truncated US Postal Codes (flag_truncated_us_postal_code)</span>
              </div>
              <span className="text-amber-400 font-mono">449 records (4.4%)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Leading zeros were dropped during CSV export for East Coast zip codes (e.g. <code>7036</code> instead of <code>07036</code>).
              <strong> Resolution:</strong> Standardized with 5-digit zero-padding in <code>postal_code_clean</code>.
            </p>
          </div>

          {/* Flag 3 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850">
            <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span>Flag 3: Canadian FSA-Only Postal Codes (flag_canadian_fsa_postal_code)</span>
              </div>
              <span className="text-sky-400 font-mono">200 records (1.96%)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Canadian records contain 3-character Forward Sortation Area (FSA) codes (e.g. <code>M7A</code>, <code>T2C</code>) rather than 6-character postal codes.
              <strong> Resolution:</strong> Flagged explicitly for regional province geocoding.
            </p>
          </div>

          {/* Flag 4 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850">
            <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Flag 4: Product ID / Division Prefix Inconsistency (flag_product_division_inconsistency)</span>
              </div>
              <span className="text-purple-400 font-mono">6 records (0.06%)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Product <em>Fizzy Lifting Drinks</em> has Product ID <code>OTH-FIZ-56000</code> (prefixed 'OTH') but is categorized under Division 'Sugar'.
              <strong> Resolution:</strong> Explicitly flagged to ensure mapping assigns it safely to Sugar Shack facility.
            </p>
          </div>

          {/* Flag 5 */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850">
            <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>Flag 5: Extreme Product Volume Imbalance (flag_extreme_product_volume_imbalance)</span>
              </div>
              <span className="text-indigo-400 font-mono">230 records (2.26%)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Top 5 Wonka chocolate bars account for <strong>96.57%</strong> of all orders (9,844 orders), while bottom 7 sugar products have only 3–10 orders each.
              <strong> Resolution:</strong> Flagged for ML class weighting to prevent minority class collapse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
