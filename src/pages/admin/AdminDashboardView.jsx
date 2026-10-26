import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  Database,
  Cpu,
  BarChart3,
  Activity,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Server,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { getAdminOverviewStats } from '../../services/adminManagementService';
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export const AdminDashboardView = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminOverviewStats().then(setStats);
  }, []);

  const domainChartData = [
    { name: 'Quantum Electronics', count: 42800, color: '#2563EB' },
    { name: 'Biotechnology', count: 35200, color: '#6366F1' },
    { name: 'Autonomous Robotics', count: 28400, color: '#22C55E' },
    { name: 'Cybersecurity', count: 21100, color: '#F59E0B' },
    { name: 'Materials Science', count: 15350, color: '#EF4444' },
  ];

  const countryChartData = [
    { country: 'United States', count: 68400 },
    { country: 'European Union', count: 41200 },
    { country: 'Japan', count: 18900 },
    { country: 'WIPO International', count: 14350 },
  ];

  const monthlyUploadData = [
    { month: 'Jan', uploads: 1200 },
    { month: 'Feb', uploads: 2100 },
    { month: 'Mar', uploads: 3400 },
    { month: 'Apr', uploads: 4800 },
    { month: 'May', uploads: 6100 },
    { month: 'Jun', uploads: 7800 },
    { month: 'Jul', uploads: 9500 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-text-main">Admin Control Center</h1>
            <Badge variant="danger" size="sm">System Master Level</Badge>
          </div>
          <p className="text-xs text-text-muted">
            Platform telemetry, AI vector index health, dataset analytics, and user governance.
          </p>
        </div>
      </div>

      {/* 8 System Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Total Registered Users */}
        <Card className="p-4 space-y-2 border-primary/30">
          <div className="flex items-center justify-between text-xs text-text-subtle">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-primary-light" />
          </div>
          <p className="text-2xl font-extrabold text-text-main font-mono">
            {stats?.totalUsers?.toLocaleString() || '12,540'}
          </p>
          <span className="text-[10px] text-success flex items-center gap-1 font-mono">
            <ArrowUpRight className="w-3 h-3" /> +14.2% this month
          </span>
        </Card>

        {/* 2. Total Patent Submissions */}
        <Card className="p-4 space-y-2 border-secondary/30">
          <div className="flex items-center justify-between text-xs text-text-subtle">
            <span>Patent Submissions</span>
            <FileText className="w-4 h-4 text-secondary-light" />
          </div>
          <p className="text-2xl font-extrabold text-text-main font-mono">
            {stats?.totalSubmissions?.toLocaleString() || '45,890'}
          </p>
          <span className="text-[10px] text-success flex items-center gap-1 font-mono">
            <ArrowUpRight className="w-3 h-3" /> +8.9% this month
          </span>
        </Card>

        {/* 3. Total Patent Records */}
        <Card className="p-4 space-y-2 border-success/30">
          <div className="flex items-center justify-between text-xs text-text-subtle">
            <span>FAISS Indexed Patents</span>
            <Database className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-extrabold text-text-main font-mono">
            142.8M
          </p>
          <span className="text-[10px] text-text-subtle font-mono">384-Dim SentenceTransformers</span>
        </Card>

        {/* 4. Total AI Analyses */}
        <Card className="p-4 space-y-2 border-warning/30">
          <div className="flex items-center justify-between text-xs text-text-subtle">
            <span>Completed RAG Scans</span>
            <Cpu className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-extrabold text-text-main font-mono">
            {stats?.totalAiAnalyses?.toLocaleString() || '38,410'}
          </p>
          <span className="text-[10px] text-success flex items-center gap-1 font-mono">
            <ArrowUpRight className="w-3 h-3" /> +18.5% this month
          </span>
        </Card>

        {/* 5. Average Novelty Score */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-text-subtle">
            <span>Average Novelty Score</span>
            <BarChart3 className="w-4 h-4 text-primary-light" />
          </div>
          <p className="text-2xl font-extrabold text-success font-mono">
            {stats?.avgNoveltyScore || 92.4}%
          </p>
          <span className="text-[10px] text-text-subtle">Calculated across all scans</span>
        </Card>

        {/* 6. System Health */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-text-subtle">
            <span>System Health</span>
            <Activity className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-extrabold text-success font-mono">
            99.9% Uptime
          </p>
          <span className="text-[10px] text-success font-bold">Healthy (0 active errors)</span>
        </Card>

        {/* 7. Storage Usage */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-text-subtle">
            <span>Storage Usage</span>
            <HardDrive className="w-4 h-4 text-secondary-light" />
          </div>
          <p className="text-2xl font-extrabold text-text-main font-mono">
            42.8 GB
          </p>
          <span className="text-[10px] text-text-subtle font-mono">Out of 100 GB Allocated</span>
        </Card>

        {/* 8. AI Index Status */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-text-subtle">
            <span>FAISS Index State</span>
            <Server className="w-4 h-4 text-primary-light" />
          </div>
          <p className="text-sm font-extrabold text-primary-light font-mono truncate">
            IndexFlatIP Active
          </p>
          <span className="text-[10px] text-text-subtle font-mono">Last rebuild: 2h ago</span>
        </Card>

      </div>

      {/* AI System Health Monitor Grid */}
      <Card className="p-6 space-y-4">
        <CardHeader className="mb-0">
          <CardTitle>AI System Health Monitor</CardTitle>
          <CardDescription>Live service status telemetry across core AI vector nodes</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          
          <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-text-subtle">Embedding Model</span>
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <p className="text-xs font-bold text-text-main">all-MiniLM-L6-v2</p>
            <Badge variant="success" size="sm">Healthy</Badge>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-text-subtle">LLM RAG Engine</span>
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <p className="text-xs font-bold text-text-main">Llama-3 / Mistral</p>
            <Badge variant="success" size="sm">Healthy</Badge>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-text-subtle">Vector Database</span>
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <p className="text-xs font-bold text-text-main">FAISS IndexFlatIP</p>
            <Badge variant="success" size="sm">Healthy</Badge>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-text-subtle">FastAPI Server</span>
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <p className="text-xs font-bold text-text-main">Port 8000 REST</p>
            <Badge variant="success" size="sm">Healthy</Badge>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-text-subtle">Firestore Storage</span>
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <p className="text-xs font-bold text-text-main">Firebase v10 DB</p>
            <Badge variant="success" size="sm">Healthy</Badge>
          </div>

        </div>
      </Card>

      {/* Dataset Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Patents by Domain Bar Chart */}
        <div className="lg:col-span-7">
          <Card className="p-6 h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Patents by Technology Domain</CardTitle>
              <CardDescription>Distribution across indexed USPTO & WIPO categories</CardDescription>
            </CardHeader>

            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={domainChartData}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#1E293B', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* 2. Monthly Dataset Uploads Line Chart */}
        <div className="lg:col-span-5">
          <Card className="p-6 h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Monthly Dataset Ingestion</CardTitle>
              <CardDescription>Monthly growth of newly indexed patent vectors</CardDescription>
            </CardHeader>

            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyUploadData}>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#1E293B', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="uploads" stroke="#22C55E" strokeWidth={3} dot={{ fill: '#22C55E' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboardView;
