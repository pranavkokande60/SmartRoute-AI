import React from 'react';
import { Truck, Shield, Bell, LogIn, LogOut, Search, Activity } from 'lucide-react';
import { getCurrentUser, clearAuthToken } from '../api';

interface NavbarProps {
  onOpenLogin: () => void;
  currentUser: any;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeAlertsCount: number;
  onOpenAlerts: () => void;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLogin,
  currentUser,
  onLogout,
  searchQuery,
  onSearchChange,
  activeAlertsCount,
  onOpenAlerts,
  onOpenCommandPalette
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white">SmartRoute AI</h1>
            <span className="text-[10px] font-semibold bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/30">
              v1.0 • Nassau Candy
            </span>
          </div>
          <p className="text-xs text-slate-400">Intelligent Logistics Analytics & Decision Support</p>
        </div>
      </div>

      {/* Global Search Bar & Command Palette Trigger */}
      <div
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center flex-1 max-w-md mx-8 cursor-pointer group"
      >
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
          <input
            type="text"
            readOnly
            placeholder="Quick search routes, orders, products, factories... (Ctrl + K)"
            className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl pl-9 pr-14 py-2 text-slate-200 placeholder-slate-500 group-hover:border-slate-700 transition-colors cursor-pointer select-none"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-750 rounded shadow-sm">
              Ctrl
            </kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-750 rounded shadow-sm">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live Simulator Status Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Simulator Live</span>
        </div>

        {/* Alerts Bell */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Active Alerts"
        >
          <Bell className="w-4 h-4" />
          {activeAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* User Account / Role Badge */}
        {currentUser ? (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-200">{currentUser.username}</div>
              <div className="text-[10px] text-sky-400 font-mono flex items-center justify-end gap-1">
                <Shield className="w-3 h-3" />
                {currentUser.role}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Login Demo</span>
          </button>
        )}
      </div>
    </header>
  );
};
