import React, { useEffect, useState, useRef } from 'react';
import { Radio, Wifi, WifiOff, Activity, ShieldAlert, Cpu, Truck, Bell, CheckCircle2 } from 'lucide-react';

interface SimulatedEvent {
  event_id: string;
  timestamp: string;
  event_type: string;
  order_id: string;
  factory: string;
  destination_state: string;
  product: string;
  ship_mode: string;
  operational_lead_time_days: number;
  risk_level: string;
  is_anomaly: boolean;
  summary: string;
}

export const LiveOperationsTab: React.FC = () => {
  const [events, setEvents] = useState<SimulatedEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Protocol detection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/live-operations`;

    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setEvents((prev) => [data, ...prev.slice(0, 49)]); // Keep last 50 events
      } catch (e) {
        console.error('Failed to parse WebSocket event', e);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    socket.onerror = (err) => {
      console.error('WebSocket Error', err);
      setIsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'ANOMALY_DETECTED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'ETA_PREDICTION_GENERATED':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'SLA_ALERT_TRIGGERED':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Connection Pill */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>WebSocket Live Operations Stream</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Live Analytics Event Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Simulates real-time pipeline dispatches, machine learning inferences, and automated anomaly flagging over WebSockets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <Wifi className="w-3.5 h-3.5" />
              <span>WebSocket Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs text-slate-400">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Connecting to Simulator...</span>
            </div>
          )}
        </div>
      </div>

      {/* Transparency Disclaimer Note */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
        <strong className="text-slate-300">Viva & Academic Evaluation Note: </strong>
        This screen demonstrates real-time WebSocket protocol streaming. Because historical shipping datasets do not possess real-time telemetry, this <em>Live Analytics Event Simulator</em> generates real-time events based on actual dataset parameters without falsely claiming real-world live company feeds.
      </div>

      {/* Live Event Feed Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>Real-Time Ingestion & Analytics Feed</span>
          </div>
          <span className="text-slate-500 font-mono">Stream Buffer: {events.length} Events</span>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto">
          {events.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              <Activity className="w-5 h-5 animate-spin mx-auto text-sky-400 mb-2" />
              Listening on /ws/live-operations... Events will appear dynamically.
            </div>
          ) : (
            events.map((evt) => (
              <div
                key={evt.event_id}
                className="p-3.5 hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                    {evt.timestamp}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getEventBadge(evt.event_type)}`}>
                        {evt.event_type}
                      </span>
                      <span className="font-mono font-semibold text-slate-300">{evt.order_id}</span>
                    </div>
                    <p className="text-slate-300 font-medium">{evt.summary}</p>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-3">
                      <span>Factory: {evt.factory}</span>
                      <span>Dest: {evt.destination_state}</span>
                      <span>Mode: {evt.ship_mode}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    evt.risk_level === 'HIGH' ? 'text-rose-400 bg-rose-500/10' : (evt.risk_level === 'MODERATE' ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10')
                  }`}>
                    {evt.risk_level} RISK
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
