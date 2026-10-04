import React, { useState, useEffect } from 'react';
import {
  Bell, X, CheckCheck, Trash2, AlertTriangle, AlertOctagon,
  Info, CheckCircle2, ArrowRight, ExternalLink, Filter,
  ShieldAlert, RefreshCw
} from 'lucide-react';
import { api } from '../api';

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
  onRefreshCount?: () => void;
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onRefreshCount
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications({
        unread_only: filterUnreadOnly,
        severity: filterSeverity !== 'ALL' ? filterSeverity : undefined
      });
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
      if (onRefreshCount) onRefreshCount();
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen, filterSeverity, filterUnreadOnly]);

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (onRefreshCount) onRefreshCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      if (onRefreshCount) onRefreshCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all operational notifications?")) return;
    try {
      await api.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      if (onRefreshCount) onRefreshCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif: any) => {
    // Automatically mark as read
    if (!notif.is_read) {
      api.markNotificationRead(notif.id).catch(console.error);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (onRefreshCount) onRefreshCount();
    }

    // Navigate to appropriate application module
    onClose();
    switch (notif.category?.toUpperCase()) {
      case 'ORDER':
        onNavigateTab('new-orders');
        break;
      case 'MODEL':
        onNavigateTab('predict');
        break;
      case 'ROUTE':
        onNavigateTab('routes');
        break;
      case 'ANOMALY':
        onNavigateTab('anomalies');
        break;
      case 'QUALITY':
        onNavigateTab('dataset');
        break;
      default:
        onNavigateTab('dashboard');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Notification Center</span>
                  {unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Operational alerts across models, orders, routes, & anomalies
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar & Batch Actions */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/90 space-y-2.5">
            {/* Severity Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
              <button
                onClick={() => setFilterSeverity('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterSeverity === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-850'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterSeverity('CRITICAL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterSeverity === 'CRITICAL'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-950 text-rose-400/80 hover:text-rose-300 border border-slate-850'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilterSeverity('WARNING')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterSeverity === 'WARNING'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-950 text-amber-400/80 hover:text-amber-300 border border-slate-850'
                }`}
              >
                Warning
              </button>
              <button
                onClick={() => setFilterSeverity('INFO')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterSeverity === 'INFO'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-950 text-sky-400/80 hover:text-sky-300 border border-slate-850'
                }`}
              >
                Info
              </button>

              <div className="border-l border-slate-800 pl-1.5 ml-auto">
                <button
                  onClick={() => setFilterUnreadOnly(prev => !prev)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                    filterUnreadOnly
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-slate-200'
                  }`}
                >
                  Unread Only
                </button>
              </div>
            </div>

            {/* Batch Controls */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/40">
              <button
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-1 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark all as read</span>
              </button>

              <button
                onClick={handleClearAll}
                disabled={notifications.length === 0}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-400 disabled:opacity-40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            </div>
          </div>

          {/* Notifications Scroll List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading && notifications.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-slate-500 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-indigo-400" />
                Loading alerts...
              </div>
            ) : notifications.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 p-6">
                <CheckCircle2 className="w-10 h-10 text-slate-700 mb-2" />
                <h4 className="text-sm font-semibold text-slate-400">All Clear!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  No active notifications matching your filter criteria. Operational parameters are within acceptable bounds.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isCritical = notif.severity === 'CRITICAL';
                const isWarning = notif.severity === 'WARNING';
                const isUnread = !notif.is_read;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                      isUnread
                        ? (isCritical
                          ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60'
                          : (isWarning
                            ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/60'
                            : 'bg-indigo-950/20 border-indigo-500/40 hover:border-indigo-500/60'))
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Unread dot */}
                    {isUnread && (
                      <span className="absolute top-3.5 right-3 w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    )}

                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 shrink-0">
                        {isCritical ? (
                          <AlertOctagon className="w-4 h-4 text-rose-400" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Info className="w-4 h-4 text-sky-400" />
                        )}
                      </div>

                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : (isWarning
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-sky-500/20 text-sky-400 border-sky-500/30')
                          }`}>
                            {notif.category || 'SYSTEM'}
                          </span>
                          <h4 className="text-xs font-bold text-white tracking-tight">
                            {notif.title}
                          </h4>
                        </div>

                        <p className="text-xs text-slate-300/90 mt-1 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                          <span>
                            {notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </span>

                          <div className="flex items-center gap-2">
                            {isUnread && (
                              <button
                                onClick={(e) => handleMarkAsRead(notif.id, e)}
                                className="text-slate-400 hover:text-white underline text-[10px]"
                              >
                                Mark read
                              </button>
                            )}
                            <span className="text-indigo-400 flex items-center gap-0.5 font-semibold group-hover:translate-x-0.5 transition-transform">
                              <span>Open</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            SmartRoute AI Real-Time Alert Engine
          </div>
        </div>
      </div>
    </div>
  );
};
