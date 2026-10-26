import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Search, ShieldCheck, Clock, Download, Terminal } from 'lucide-react';
import { getSystemAuditLogs } from '../../services/adminManagementService';
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export const SystemLogsView = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getSystemAuditLogs().then(setLogs);
  }, []);

  const handleExportLogs = () => {
    const textContent = logs.map((l) => `[${l.timestamp}] [${l.user}] ${l.action}: ${l.details}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_audit_logs_${Date.now()}.log`;
    a.click();
    toast.success('Exported system audit log stream!');
  };

  const filteredLogs = logs.filter((l) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.user.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-card-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-text-main">System Audit Activity Logs</h1>
            <Badge variant="primary" size="sm">{logs.length} Log Entries</Badge>
          </div>
          <p className="text-xs text-text-muted">
            Immutable audit log stream of all administrative actions, bulk dataset imports, and vector rebuilds.
          </p>
        </div>

        <Button variant="outline" size="sm" icon={Download} onClick={handleExportLogs}>
          Export Log File
        </Button>
      </div>

      {/* Main Logs Console Card */}
      <Card className="p-6 space-y-4 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-text-main">
            <Terminal className="w-5 h-5 text-primary-light" />
            <span>Live Audit Telemetry Stream</span>
          </div>

          <div className="relative w-full sm:w-72 font-sans">
            <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter logs by action or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0F172A] border border-card-border rounded-xl py-2 pl-10 pr-3 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Logs Table / Stream */}
        <div className="overflow-x-auto rounded-xl border border-card-border/60 bg-[#0B1120] p-4 font-mono text-[11px] space-y-2 max-h-[600px] overflow-y-auto">
          {filteredLogs.map((l) => (
            <div key={l.id} className="p-2.5 rounded-lg border border-card-border/40 bg-[#0F172A] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-primary-light font-bold">[{l.action}]</span>
                  <span className="text-text-main font-bold">{l.details}</span>
                </div>
                <div className="text-[10px] text-text-subtle">By: {l.user}</div>
              </div>
              <span className="text-[10px] text-text-subtle shrink-0">{l.timestamp}</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};

export default SystemLogsView;
