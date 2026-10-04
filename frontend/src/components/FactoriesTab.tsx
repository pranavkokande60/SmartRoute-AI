import React, { useEffect, useState } from 'react';
import { Factory, MapPin, Package, Clock, AlertTriangle, DollarSign, ChevronRight, Layers } from 'lucide-react';
import { api } from '../api';

export const FactoriesTab: React.FC = () => {
  const [factories, setFactories] = useState<any[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<any | null>(null);
  const [factoryDetail, setFactoryDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFactories()
      .then((data) => {
        setFactories(data);
        if (data.length > 0) {
          handleSelectFactory(data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelectFactory = async (fac: any) => {
    setSelectedFactory(fac);
    try {
      const res = await api.getFactoryDetail(fac.name);
      setFactoryDetail(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Factory className="w-5 h-5 text-sky-400" />
          Manufacturing Hub Intelligence
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Performance telemetry across Nassau Candy's 5 production facilities and specialized product lines.
        </p>
      </div>

      {/* Factories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {factories.map((f) => {
          const isSelected = selectedFactory?.name === f.name;
          return (
            <div
              key={f.name}
              onClick={() => handleSelectFactory(f)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[10px] text-sky-400 font-bold">{f.id}</span>
                <span className="text-[10px] text-slate-500">{f.state}</span>
              </div>
              <h3 className="font-bold text-xs text-white truncate" title={f.name}>{f.name}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{f.specialization}</p>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{f.total_shipments?.toLocaleString()} orders</span>
                <span className="font-mono font-semibold text-emerald-400">{f.avg_operational_lead_time}d avg</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Factory Deep Dive */}
      {selectedFactory && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Metadata Card */}
          <div className="md:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div>
              <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Facility Profile</div>
              <h3 className="text-lg font-bold text-white mt-0.5">{selectedFactory.name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Located in {selectedFactory.city}, {selectedFactory.state} (Lat: {selectedFactory.latitude}, Lng: {selectedFactory.longitude})
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                <span className="text-slate-400">Daily Production Capacity</span>
                <span className="font-mono font-bold text-white">{selectedFactory.capacity_units_day?.toLocaleString()} units</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                <span className="text-slate-400">Total Net Revenue</span>
                <span className="font-mono font-bold text-emerald-400">${selectedFactory.total_sales?.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                <span className="text-slate-400">Active Delivery Corridors</span>
                <span className="font-mono font-bold text-white">{selectedFactory.active_routes_count} states</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                Manufactured Candy Lines
              </div>
              <div className="space-y-1.5">
                {selectedFactory.products?.map((p: string) => (
                  <div key={p} className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Factory Outbound Routes */}
          <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Outbound Corridors from {selectedFactory.name}
                </h3>
                <p className="text-[11px] text-slate-400">Ranked by shipment volume and delivery performance</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {factoryDetail?.routes?.length || 0} Connected States
              </span>
            </div>

            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Destination State</th>
                    <th className="py-2.5 px-3">Volume</th>
                    <th className="py-2.5 px-3">Avg Lead Time</th>
                    <th className="py-2.5 px-3">Delay Rate</th>
                    <th className="py-2.5 px-3">Efficiency Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {factoryDetail?.routes?.map((r: any) => (
                    <tr key={r.route_id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-semibold text-slate-200">{r.destination_state}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-medium">{r.shipments_count.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-sky-400">{r.avg_lead_time} days</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-300">{r.delay_percentage}%</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">{r.efficiency_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
