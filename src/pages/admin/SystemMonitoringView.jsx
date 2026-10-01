import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Server,
  Cpu,
  HardDrive,
  Database,
  ShieldCheck,
  Download,
  RefreshCw,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Globe,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  getSystemMonitoringData,
  triggerSystemDatabaseBackup,
  getFilteredSystemErrorLogs,
} from '../../services/systemMonitoringService';
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ApiEndpointMonitorTable from '../../components/admin/ApiEndpointMonitorTable';
import toast from 'react-hot-toast';

export const SystemMonitoringView = () => {
  const [data, setData] = useState(null);
  const [errorLogs, setErrorLogs] = useState([]);
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    getSystemMonitoringData().then(setData);
    getFilteredSystemErrorLogs().then(setErrorLogs);
  }, []);

  const handleFilterSeverity = async (sev) => {
    setSelectedSeverity(sev);
    const logs = await getFilteredSystemErrorLogs({ severity: sev });
    setErrorLogs(logs);
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      await triggerSystemDatabaseBackup();
      toast.success('System database snapshot created and downloaded!', { icon: '📦' });
    } catch (err) {
      toast.error('Backup failed: ' + err.message);
    } finally {
      setBackingUp(false);
    }
  };

  if (!data) return null;

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-card-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-text-main">System Health & Platform Monitor</h1>
            <Badge variant="success" size="sm">Uptime: {data.uptime}</Badge>
          </div>
          <p className="text-xs text-text-muted">
            Live telemetry, hardware load gauges, API endpoint latencies, database operations, and backup manager.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => toast.success('Telemetry refreshed')}>
            Refresh Status
          </Button>
          <Button variant="primary" size="sm" icon={Download} loading={backingUp} onClick={handleBackup} className="shadow-glow-primary">
            Create System Backup
          </Button>
        </div>
      </div>

      {/* 2. Hardware Gauges & Key Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="p-4 space-y-2 border-primary/30">
          <div className="flex items-center justify-between text-xs text-text-subtle">
            <span>CPU Usage</span>
            <Cpu className="w-4 h-4 text-primary-light" />
          </div>
          <p className="text-2xl font-extrabold text-text-main font-mono">
            {data.hardware.cpuUsage}%
          </p>
          <div className="w-full bg-[#0F172A] border border-card-border h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${data.hardware.cpuUsage}%` }} />
          </div>
        </Card>

        <Card className="p-4 space-y-2 border-success/30">
          <div className="flex items-center justify-between text-xs text-text-subtle">
            <span>RAM Memory Load</span>
            <HardDrive className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-extrabold text-text-main font-mono">
            {data.hardware.memoryUsageGB} GB
          </p>
          <span className="text-[10px] text-text-subtle font-mono">66.8% of 64 GB Allocated</span>
        </Card>

        <Card className="p-4 space-y-2 border-secondary/30">
          <div className="flex items-center justify-between text-xs text-text-subtle">
            <span>Request Throughput</span>
            <Zap className="w-4 h-4 text-secondary-light" />
          </div>
          <p className="text-2xl font-extrabold text-secondary-light font-mono">
            {data.hardware.networkThroughputReqMin.toLocaleString()} req/min
          </p>
          <span className="text-[10px] text-success font-mono">Optimal Throughput</span>
        </Card>

        <Card className="p-4 space-y-2 border-warning/30">
          <div className="flex items-center justify-between text-xs text-text-subtle">
            <span>Storage Allocation</span>
            <Database className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-extrabold text-text-main font-mono">
            {data.hardware.storageUsageGB} GB
          </p>
          <span className="text-[10px] text-text-subtle font-mono">Out of 100 GB Firestore/S3</span>
        </Card>

      </div>

      {/* 3. Live Service Status Grid (8 Core Services) */}
      <Card className="p-6 space-y-4">
        <CardHeader className="mb-0">
          <CardTitle>Live Service Telemetry & Health Status</CardTitle>
          <CardDescription>Real-time health status across all 8 production micro-services</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
          {data.services.map((s, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#0F172A] border border-card-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-text-subtle">{s.category}</span>
                <Badge variant={s.status === 'Healthy' ? 'success' : 'danger'} size="sm">
                  {s.status}
                </Badge>
              </div>

              <h4 className="font-bold text-text-main text-xs">{s.name}</h4>
              <div className="flex items-center justify-between text-[10px] font-mono text-text-subtle pt-1 border-t border-card-border/60">
                <span>Latency: <strong className="text-primary-light">{s.latency}</strong></span>
                <span>Uptime: {s.uptime}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. API Endpoint Monitoring Table */}
      <ApiEndpointMonitorTable apiEndpoints={data.apiEndpoints} />

      {/* 5. AI Latency Breakdown & Database Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* AI Performance Breakdown */}
        <div className="lg:col-span-6">
          <Card className="p-6 h-full space-y-4">
            <CardHeader className="mb-0">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-light" />
                AI Model Latency & Performance Breakdown
              </CardTitle>
              <CardDescription>Processing delays across RAG embedding and vector search stages</CardDescription>
            </CardHeader>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border flex justify-between items-center">
                <span className="text-text-muted">Total Average AI Processing Time</span>
                <span className="font-mono font-extrabold text-success text-base">{data.aiPerformance.avgTotalAiTime}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border flex justify-between items-center">
                <span className="text-text-muted">Embedding Generation Time (384-D)</span>
                <span className="font-mono font-bold text-primary-light">{data.aiPerformance.embeddingGenTime}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border flex justify-between items-center">
                <span className="text-text-muted">FAISS Nearest-Neighbor Search Time</span>
                <span className="font-mono font-bold text-primary-light">{data.aiPerformance.faissSearchTime}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border flex justify-between items-center">
                <span className="text-text-muted">LLM Response Generation Time</span>
                <span className="font-mono font-bold text-primary-light">{data.aiPerformance.llmResponseTime}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Database Metrics & Security */}
        <div className="lg:col-span-6">
          <Card className="p-6 h-full space-y-4">
            <CardHeader className="mb-0">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-success" />
                Database Operations & Security Alerts
              </CardTitle>
              <CardDescription>Firestore operation throughput and security telemetry</CardDescription>
            </CardHeader>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
                <span className="text-[10px] text-text-subtle uppercase">Daily Read Ops</span>
                <p className="font-mono font-bold text-text-main text-base">{data.databaseMetrics.dailyReadOps}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
                <span className="text-[10px] text-text-subtle uppercase">Daily Write Ops</span>
                <p className="font-mono font-bold text-text-main text-base">{data.databaseMetrics.dailyWriteOps}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
                <span className="text-[10px] text-text-subtle uppercase">Failed Login Attempts</span>
                <p className="font-mono font-bold text-warning text-base">{data.security.failedLoginAttempts}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
                <span className="text-[10px] text-text-subtle uppercase">Blocked IP Addresses</span>
                <p className="font-mono font-bold text-success text-base">{data.security.blockedIpsCount}</p>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* 6. System Error Logs & Deployment Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Error Logs Inspector */}
        <div className="lg:col-span-7">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-warning" />
                System Error Log Inspector
              </CardTitle>

              {/* Severity Filter */}
              <div className="flex gap-1">
                {['All', 'Critical', 'Warning', 'Info'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => handleFilterSeverity(sev)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      selectedSeverity === sev ? 'bg-primary text-white' : 'bg-card text-text-subtle hover:text-text-main'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 font-mono text-[11px] max-h-56 overflow-y-auto">
              {errorLogs.map((l) => (
                <div key={l.id} className="p-2.5 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={l.severity === 'Critical' ? 'danger' : l.severity === 'Warning' ? 'warning' : 'outline'} size="sm">
                      {l.severity}
                    </Badge>
                    <span className="text-[10px] text-text-subtle">{l.timestamp}</span>
                  </div>
                  <p className="text-text-main font-bold">[{l.module}] {l.message}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Deployment Information */}
        <div className="lg:col-span-5">
          <Card className="p-6 h-full space-y-4">
            <CardHeader className="mb-0">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-light" />
                Production Deployment Metadata
              </CardTitle>
              <CardDescription>Target environment URLs, Docker container version, and Git commit</CardDescription>
            </CardHeader>

            <div className="space-y-2.5 text-xs pt-2 font-mono">
              <div className="p-2.5 rounded-xl bg-[#0F172A] border border-card-border flex justify-between">
                <span className="text-text-subtle">Version:</span>
                <strong className="text-success">{data.deployment.version}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0F172A] border border-card-border flex justify-between">
                <span className="text-text-subtle">Environment:</span>
                <strong className="text-primary-light uppercase">{data.deployment.environment}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0F172A] border border-card-border flex justify-between">
                <span className="text-text-subtle">Git Commit:</span>
                <strong className="text-text-main">{data.deployment.gitCommit}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0F172A] border border-card-border flex justify-between">
                <span className="text-text-subtle">Frontend Host:</span>
                <span className="text-text-muted truncate max-w-[180px]">{data.deployment.frontendUrl}</span>
              </div>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};

export default SystemMonitoringView;
