import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabKey } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { DashboardTab } from './components/DashboardTab';
import { RoutesTab } from './components/RoutesTab';
import { RouteComparisonTab } from './components/RouteComparisonTab';
import { MapTab } from './components/MapTab';
import { PredictionTab } from './components/PredictionTab';
import { AnomaliesTab } from './components/AnomaliesTab';
import { ForecastTab } from './components/ForecastTab';
import { SimulationTab } from './components/SimulationTab';
import { FactoriesTab } from './components/FactoriesTab';
import { LiveOperationsTab } from './components/LiveOperationsTab';
import { AlertsTab } from './components/AlertsTab';
import { QualityTab } from './components/QualityTab';
import { NewOrdersTab } from './components/NewOrdersTab';
import { PredictionPerformanceTab } from './components/PredictionPerformanceTab';
import { PredictionPlaygroundTab } from './components/PredictionPlaygroundTab';
import { AIAssistantTab } from './components/AIAssistantTab';
import { NotificationCenterDrawer } from './components/NotificationCenterDrawer';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { api, getCurrentUser, clearAuthToken } from './api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const [currentUser, setCurrentUser] = useState<any>(getCurrentUser());
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Core Data State
  const [summary, setSummary] = useState<any | null>(null);
  const [charts, setCharts] = useState<any | null>(null);
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [mapData, setMapData] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Global Ctrl + K / Cmd + K Command Palette Keyboard Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    // Initial fetch of dashboard and route data
    api.getSummary().then(setSummary).catch(console.error);
    api.getCharts().then(setCharts).catch(console.error);
    api.getAiSummary().then(setAiSummary).catch(console.error);
    api.getRoutes().then(setRoutes).catch(console.error);
    api.getMapData().then(setMapData).catch(console.error);
    api.getAlerts().then(setAlerts).catch(console.error);
    api.getNotifications().then(r => setUnreadNotifCount(r.unread_count || 0)).catch(console.error);
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        onOpenLogin={() => setIsLoginOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeAlertsCount={unreadNotifCount}
        onOpenAlerts={() => setIsNotificationOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activeAlertsCount={alerts.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
          <div className="max-w-7xl mx-auto pb-12">
            {currentTab === 'dashboard' && (
              <DashboardTab
                summary={summary}
                charts={charts}
                aiSummary={aiSummary}
                onNavigate={setCurrentTab}
              />
            )}
            {currentTab === 'new-orders' && <NewOrdersTab />}
            {currentTab === 'routes' && <RoutesTab routes={routes} />}
            {currentTab === 'route-comparison' && <RouteComparisonTab />}
            {currentTab === 'map' && <MapTab mapData={mapData} />}
            {currentTab === 'predict' && <PredictionTab />}
            {currentTab === 'prediction-performance' && <PredictionPerformanceTab />}
            {currentTab === 'playground' && <PredictionPlaygroundTab />}
            {currentTab === 'anomalies' && <AnomaliesTab />}
            {currentTab === 'forecast' && <ForecastTab />}
            {currentTab === 'simulation' && <SimulationTab />}
            {currentTab === 'assistant' && <AIAssistantTab />}
            {currentTab === 'factories' && <FactoriesTab />}
            {currentTab === 'live' && <LiveOperationsTab />}
            {currentTab === 'alerts' && <AlertsTab />}
            {currentTab === 'dataset' && <QualityTab />}
          </div>
        </main>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* Notification Center Slide-over Drawer */}
      <NotificationCenterDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onNavigateTab={setCurrentTab}
        onRefreshCount={() => api.getNotifications().then(r => setUnreadNotifCount(r.unread_count || 0)).catch(console.error)}
      />

      {/* Global Command Palette Modal (Ctrl + K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={setCurrentTab}
      />
    </div>
  );
};

export default App;
