import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCircle2, FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import { NOTIFICATIONS_DATA } from '../../utils/dashboardData';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-card/60 border border-card-border/80 text-text-muted hover:text-text-main hover:border-primary/40 transition-all focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 glass-card rounded-2xl shadow-2xl border border-card-border py-2 z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-card-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-text-main">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-semibold bg-primary/20 text-primary-light px-2 py-0.5 rounded-full border border-primary/30">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-primary-light hover:underline flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-card-border/40">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    !n.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-card/60'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-card border border-card-border text-primary-light shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-text-main truncate">{n.title}</h5>
                      <span className="text-[10px] text-text-subtle shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-text-muted leading-snug">{n.message}</p>
                  </div>

                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-card-border/60 text-center">
              <span className="text-[11px] text-text-subtle font-mono">
                System Log Audit Channel Active
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
