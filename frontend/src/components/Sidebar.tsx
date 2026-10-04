import React from 'react';
import {
  LayoutDashboard,
  GitFork,
  MapPin,
  Cpu,
  AlertTriangle,
  TrendingUp,
  Sliders,
  Factory,
  Radio,
  Bell,
  Database,
  PackagePlus,
  BarChart3,
  FlaskConical,
  GitCompare,
  Bot
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'new-orders'
  | 'routes'
  | 'route-comparison'
  | 'map'
  | 'predict'
  | 'prediction-performance'
  | 'playground'
  | 'anomalies'
  | 'forecast'
  | 'simulation'
  | 'assistant'
  | 'factories'
  | 'live'
  | 'alerts'
  | 'dataset';

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  activeAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, activeAlertsCount }) => {
  const navItems = [
    { key: 'dashboard', label: 'Command Center', icon: LayoutDashboard, category: 'Core Analytics' },
    { key: 'new-orders', label: '🆕 New Order Management', icon: PackagePlus, category: 'Order Management' },
    { key: 'routes', label: 'Route Explorer', icon: GitFork, category: 'Core Analytics' },
    { key: 'route-comparison', label: '⚖️ Route Comparison', icon: GitCompare, category: 'Core Analytics' },
    { key: 'map', label: 'US Geographic Map', icon: MapPin, category: 'Core Analytics' },
    { key: 'predict', label: 'ML Prediction Center', icon: Cpu, category: 'Machine Learning' },
    { key: 'prediction-performance', label: '📊 Prediction Performance', icon: BarChart3, category: 'Machine Learning' },
    { key: 'playground', label: '🧪 Prediction Playground', icon: FlaskConical, category: 'Machine Learning' },
    { key: 'anomalies', label: 'Anomaly Detection', icon: AlertTriangle, category: 'Machine Learning' },
    { key: 'forecast', label: 'Volume Forecasting', icon: TrendingUp, category: 'Machine Learning' },
    { key: 'simulation', label: 'What-If Simulator', icon: Sliders, category: 'Decision Support' },
    { key: 'assistant', label: '🤖 AI Logistics Assistant', icon: Bot, category: 'Decision Support' },
    { key: 'factories', label: 'Factory Intelligence', icon: Factory, category: 'Operations' },
    { key: 'live', label: 'Live Operations (WS)', icon: Radio, category: 'Operations' },
    { key: 'alerts', label: 'Operational Alerts', icon: Bell, badge: activeAlertsCount, category: 'Operations' },
    { key: 'dataset', label: 'Dataset & Audit Flags', icon: Database, category: 'Data & Governance' },
  ];

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between py-4 select-none shrink-0 overflow-y-auto">
      <div className="space-y-6">
        <div className="px-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectTab(item.key as TabKey)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 font-semibold border border-sky-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 pt-4 border-t border-slate-800/80">
        <div className="text-[11px] text-slate-500">
          <span className="font-semibold text-slate-400">Nassau Candy Logistics</span>
          <p className="mt-0.5 text-[10px] text-slate-600">Final Year Internship Project</p>
        </div>
      </div>
    </aside>
  );
};
