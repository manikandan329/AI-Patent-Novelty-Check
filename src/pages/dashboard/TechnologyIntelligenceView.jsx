import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  Globe,
  Sparkles,
  Layers,
  Building,
  User,
  Download,
  FileSpreadsheet,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  Zap,
  Activity,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  calculateTimeSeriesAnalytics,
  DETECTED_EMERGING_TECHNOLOGIES,
  compareTechnologyDomains,
  calculateGeographicalDistribution,
  generateAiTechnologyInsights,
  exportIntelligenceData,
} from '../../services/technologyIntelligenceService';
import { TECHNOLOGY_DOMAINS } from '../../services/patentDocumentProcessor';
import { extractApplicantAndInventorNetworks } from '../../services/patentRelationshipService';

export const TechnologyIntelligenceView = () => {
  const navigate = useNavigate();

  // State
  const [selectedDomain, setSelectedDomain] = useState('Artificial Intelligence');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'emerging' | 'comparison' | 'geo' | 'applicants' | 'clusters' | 'ai'
  const [yearRange, setYearRange] = useState([2018, 2026]);

  const timeSeriesData = calculateTimeSeriesAnalytics(selectedDomain);
  const domainComparisonList = compareTechnologyDomains(['Artificial Intelligence', 'Agriculture & AgTech', 'Quantum Electronics', 'Biotechnology', 'Cybersecurity']);
  const geoDistribution = calculateGeographicalDistribution();
  const { applicantsList, inventorsList } = extractApplicantAndInventorNetworks();
  const aiInsightText = generateAiTechnologyInsights(selectedDomain, timeSeriesData);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 animate-fadeIn">
      
      {/* Top Header & Control Bar */}
      <div className="sticky top-16 z-30 bg-[#0B1120]/90 backdrop-blur-md p-4 rounded-2xl border border-card-border shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Module 16 Technology Intelligence</Badge>
              <span className="text-xs text-text-subtle font-mono">Dataset: 2018–2026 Filings Synced</span>
            </div>
            <h1 className="text-xl font-extrabold text-text-main">
              Patent Trend & Technology Intelligence Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Domain Selector */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-[#0F172A] border border-primary/40 text-text-main text-xs rounded-xl px-3 py-2 font-bold focus:outline-none"
            >
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Agriculture & AgTech">Agriculture & AgTech</option>
              <option value="Quantum Electronics">Quantum Electronics</option>
              <option value="Biotechnology">Biotechnology</option>
              <option value="Cybersecurity">Cybersecurity & Cryptography</option>
              <option value="Materials Science">Materials Science & EV</option>
            </select>

            <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={() => exportIntelligenceData('csv', selectedDomain, timeSeriesData)}>
              Export CSV Data
            </Button>
            <Button variant="primary" size="sm" icon={Download} onClick={() => exportIntelligenceData('pdf', selectedDomain, timeSeriesData)}>
              Export PDF Report
            </Button>
          </div>
        </div>
      </div>

      {/* KPI SUMMARY METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 space-y-2 border-primary/40">
          <span className="text-xs font-semibold text-text-subtle">Total Patents Filings (2018-2026)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-primary-light font-mono">
              {timeSeriesData.combined[timeSeriesData.combined.length - 3]?.patentCount || 710}
            </span>
            <Badge variant="primary" size="sm">Active</Badge>
          </div>
        </Card>

        <Card className="p-5 space-y-2 border-success/40">
          <span className="text-xs font-semibold text-text-subtle">Recent YoY Growth Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-success font-mono">
              +{timeSeriesData.latestYoYGrowth}%
            </span>
            <span className="text-xs font-bold text-success flex items-center">
              <ArrowUpRight className="w-4 h-4" /> Increasing
            </span>
          </div>
        </Card>

        <Card className="p-5 space-y-2 border-warning/40">
          <span className="text-xs font-semibold text-text-subtle">Emerging Technology Areas</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-warning font-mono">
              {DETECTED_EMERGING_TECHNOLOGIES.length}
            </span>
            <Badge variant="warning" size="sm">&gt; 20% YoY Growth</Badge>
          </div>
        </Card>

        <Card className="p-5 space-y-2 border-secondary/40">
          <span className="text-xs font-semibold text-text-subtle">Domain CAGR (2018-2026)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-secondary font-mono">
              +{timeSeriesData.cagr}%
            </span>
            <span className="text-xs text-text-subtle">Compound Annual</span>
          </div>
        </Card>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-card-border pb-3">
        {[
          { id: 'overview', label: 'Overview & Trend Charts', icon: TrendingUp },
          { id: 'emerging', label: 'Emerging Technologies', icon: Zap },
          { id: 'comparison', label: 'Domain Comparison Matrix', icon: BarChart3 },
          { id: 'geo', label: 'Geographical Landscape', icon: Globe },
          { id: 'applicants', label: 'Applicant & Inventor Portfolios', icon: Building },
          { id: 'ai', label: 'AI Tech Insights & Report', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-card text-text-muted hover:text-text-main border border-card-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB PANELS */}

      {/* TAB 1: OVERVIEW & TREND CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Prediction vs Historical Disclaimer Callout */}
          <div className="bg-primary/10 border border-primary/30 p-4 rounded-2xl flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-light shrink-0" />
              <span>
                <strong>Methodology:</strong> Chart displays historical patent filings (2018–2026) alongside a 3-Year Moving Average and <strong className="text-primary-light">ML Linear Regression Forecasts (2027–2028)</strong>. Predictions are statistical estimations.
              </span>
            </div>
            <Badge variant="outline" size="sm">Statistical Forecast</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Area Chart: Yearly Filings */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text-main">Yearly Patent Filing Activity Timeline</h3>
                <span className="text-xs text-text-subtle font-mono">{selectedDomain}</span>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData.combined}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#94A3B8" fontSize={10} />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip />
                    <Area type="monotone" dataKey="patentCount" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Line Chart: Moving Average & YoY Growth */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text-main">3-Year Moving Average & Forecast Trajectory</h3>
                <span className="text-xs text-success font-bold">YoY Growth Trend</span>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData.combined}>
                    <XAxis dataKey="year" stroke="#94A3B8" fontSize={10} />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="patentCount" name="Annual Filings" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="movingAverage3Yr" name="3-Yr Moving Avg" stroke="#10B981" strokeWidth={2} strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

          </div>
        </div>
      )}

      {/* TAB 2: EMERGING TECHNOLOGIES */}
      {activeTab === 'emerging' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-card-border pb-3">
              <div>
                <h3 className="text-base font-bold text-text-main">Detected Emerging Technology Areas</h3>
                <p className="text-xs text-text-muted">Sub-domains exhibiting rapid patent filing acceleration (&gt; 20% YoY expansion).</p>
              </div>
              <Badge variant="warning" size="sm">{DETECTED_EMERGING_TECHNOLOGIES.length} High-Growth Areas</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DETECTED_EMERGING_TECHNOLOGIES.map((tech, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[#0F172A] border border-warning/30 space-y-3 hover:border-warning/60 transition-all">
                  <div className="flex items-center justify-between">
                    <Badge variant="warning" size="sm">{tech.status}</Badge>
                    <span className="font-mono text-sm font-extrabold text-success">+{tech.growthRate}% YoY</span>
                  </div>

                  <h4 className="text-xs font-bold text-text-main leading-snug">{tech.name}</h4>
                  <p className="text-[11px] text-text-subtle font-mono">Domain: {tech.domain}</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-card-border/60 text-xs">
                    <div>
                      <span className="text-text-subtle font-semibold">2026 Count:</span>
                      <p className="text-text-main font-bold font-mono">{tech.currentCount} patents</p>
                    </div>
                    <div>
                      <span className="text-text-subtle font-semibold">2025 Count:</span>
                      <p className="text-text-muted font-mono">{tech.previousCount} patents</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: DOMAIN COMPARISON */}
      {activeTab === 'comparison' && (
        <Card className="p-6 overflow-x-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-text-main">Cross-Domain Technology Comparison Matrix</h3>
              <p className="text-xs text-text-muted">Side-by-side evaluation of filing volumes, growth velocity, and leading assignees.</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-[#0F172A] border-b border-card-border text-text-subtle uppercase font-bold">
                <th className="py-3 px-4">Technology Domain</th>
                <th className="py-3 px-4">2026 Patent Volume</th>
                <th className="py-3 px-4">YoY Growth Velocity</th>
                <th className="py-3 px-4">Recent Filings</th>
                <th className="py-3 px-4">Citation Velocity</th>
                <th className="py-3 px-4">Leading Assignee Applicant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/40 font-mono">
              {domainComparisonList.map((d, i) => (
                <tr key={i} className="hover:bg-card/40">
                  <td className="py-3.5 px-4 font-sans font-bold text-text-main">{d.domainName}</td>
                  <td className="py-3.5 px-4 font-bold text-primary-light">{d.patentCount}</td>
                  <td className="py-3.5 px-4 text-success font-bold">+{d.growthRate}%</td>
                  <td className="py-3.5 px-4 text-text-muted">{d.recentFilingsCount}</td>
                  <td className="py-3.5 px-4 text-warning">{d.citationVelocity}</td>
                  <td className="py-3.5 px-4 font-sans text-text-subtle">{d.leadingApplicant}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* TAB 4: GEOGRAPHICAL LANDSCAPE */}
      {activeTab === 'geo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-text-main">Geographic Distribution by Patent Office</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={geoDistribution} dataKey="count" nameKey="country" cx="50%" cy="50%" outerRadius={80} label>
                    {geoDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-text-main">Jurisdiction Growth Metrics</h3>
            <div className="space-y-3">
              {geoDistribution.map((g, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-text-main">{g.country}</div>
                    <div className="text-[11px] text-text-subtle">{g.count} Patents ({g.percentage}%)</div>
                  </div>
                  <span className="font-mono text-success font-bold">{g.growth} YoY</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: APPLICANT & INVENTOR PORTFOLIOS */}
      {activeTab === 'applicants' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-text-main">Major Assignee Applicants</h3>
            <div className="space-y-3">
              {applicantsList.map((app, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-text-main">{app.name}</div>
                    <div className="text-[11px] text-text-subtle">{app.domainsList}</div>
                  </div>
                  <span className="font-mono text-primary-light font-bold">{app.patentCount} Patents</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-text-main">Top Key Inventors</h3>
            <div className="space-y-3">
              {inventorsList.map((inv, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-text-main">{inv.name}</div>
                    <div className="text-[11px] text-text-subtle">Assignee: {inv.applicant}</div>
                  </div>
                  <Badge variant="outline" size="sm">{inv.domain}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: AI TECH INSIGHTS & REPORT */}
      {activeTab === 'ai' && (
        <Card className="p-6 space-y-6 border-primary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-main">AI-Generated Technology Intelligence Insights</h3>
              <p className="text-xs text-text-muted">Derived exclusively from empirical knowledge base statistics.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1120] border border-card-border text-xs text-text-muted leading-relaxed whitespace-pre-line font-sans">
            {aiInsightText}
          </div>

          <div className="pt-4 border-t border-card-border flex justify-end gap-3">
            <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={() => exportIntelligenceData('csv', selectedDomain, timeSeriesData)}>
              Download CSV Data
            </Button>
            <Button variant="primary" size="sm" icon={Download} onClick={() => exportIntelligenceData('pdf', selectedDomain, timeSeriesData)}>
              Download Intelligence PDF Report
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
};

export default TechnologyIntelligenceView;
