import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Globe,
  Building2,
  Clock,
  Sparkles,
  Download,
  FileText,
  PieChart as PieIcon,
  BarChart3,
  Award,
  Compass,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getMarketIntelligenceData, exportMarketInsightsReport } from '../../services/marketIntelligenceEngine';
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import CompetitorAnalysisCard from '../../components/dashboard/CompetitorAnalysisCard';
import TechnologyTimelineCard from '../../components/dashboard/TechnologyTimelineCard';
import toast from 'react-hot-toast';

export const MarketInsightsView = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      const subId = submissionId || 'SUB-2026-98142';
      const data = await getMarketIntelligenceData(subId);
      if (isMounted) {
        setMarketData(data);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [submissionId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Sparkles className="w-10 h-10 animate-spin text-primary-light" />
        <p className="text-sm font-semibold text-text-muted">
          Analyzing 140M+ global patent filings for market intelligence...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      
      {/* 1. Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-secondary/40 shadow-glow-primary space-y-6 bg-hero-gradient">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" size="sm">Patent Intelligence Suite</Badge>
              <span className="text-xs font-mono text-text-subtle">{marketData?.submissionId}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
              Patent Landscape & Market Intelligence
            </h1>
            <p className="text-xs text-text-muted max-w-2xl">
              Competitive positioning, corporate filers breakdown, geographic filing leadership, and chronological technology evolution in {marketData?.technologyDomain}.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => exportMarketInsightsReport(marketData, 'csv')}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={FileText}
              onClick={() => exportMarketInsightsReport(marketData, 'pdf')}
              className="shadow-glow-primary"
            >
              Export Market PDF
            </Button>
          </div>
        </div>

        {/* Top Telemetry Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-card-border/60">
          <div className="p-3 rounded-2xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-subtle">Annual Domain Growth</span>
            <p className="text-2xl font-mono font-extrabold text-success">
              {marketData?.growthRate}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-subtle">Primary Corporate Competitor</span>
            <p className="text-xs font-extrabold text-text-main truncate">
              {marketData?.topCompanies?.[0]?.company}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-subtle">Leading Patent Office</span>
            <p className="text-base font-extrabold text-primary-light font-mono">USPTO (48.2%)</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-subtle">Market Velocity</span>
            <p className="text-base font-extrabold text-success font-mono">High Filings Surge</p>
          </div>
        </div>
      </div>

      {/* 2. Technology Growth Area Chart & Country Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Technology Growth Area Chart */}
        <div className="lg:col-span-7">
          <Card className="p-6 h-full flex flex-col justify-between space-y-4">
            <CardHeader className="mb-0">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Technology Domain Patent Growth Rate (2020-2026)
              </CardTitle>
              <CardDescription>Annual filing volume acceleration in {marketData?.technologyDomain}</CardDescription>
            </CardHeader>

            <div className="w-full h-64 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData?.technologyGrowth || []}>
                  <defs>
                    <linearGradient id="colorFilings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1E293B', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="filings" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorFilings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Country Filing Distribution Pie Chart */}
        <div className="lg:col-span-5">
          <Card className="p-6 h-full flex flex-col justify-between space-y-4">
            <CardHeader className="mb-0">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-light" />
                Geographic Patent Filing Leadership
              </CardTitle>
              <CardDescription>Country & regional patent office share breakdown</CardDescription>
            </CardHeader>

            <div className="w-full h-56 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketData?.topCountries || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="percentage"
                  >
                    {(marketData?.topCountries || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E293B', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-card-border/60">
              {(marketData?.topCountries || []).map((c) => (
                <div key={c.country} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="truncate text-text-muted">{c.country}: <strong className="text-text-main">{c.percentage}%</strong></span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

      {/* 3. Top Corporate Competitors Table */}
      <CompetitorAnalysisCard topCompanies={marketData?.topCompanies || []} />

      {/* 4. Technology Evolution Timeline */}
      <TechnologyTimelineCard milestones={marketData?.timelineMilestones || []} />

      {/* 5. Underexplored Market Opportunities Cards */}
      <Card className="p-6 space-y-4">
        <CardHeader className="mb-0">
          <CardTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-warning" />
            Underexplored Technology Opportunity Segments
          </CardTitle>
          <CardDescription>Low-competition patent categories with high innovation potential</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          {(marketData?.futureOpportunities || []).map((opp, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#0F172A] border border-card-border space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="warning" size="sm">{opp.potential} Potential</Badge>
                  <span className="text-[10px] text-success font-mono">{opp.competition}</span>
                </div>
                <h4 className="font-bold text-text-main leading-snug pt-1">{opp.area}</h4>
                <p className="text-text-muted leading-relaxed text-[11px]">{opp.description}</p>
              </div>

              <div className="pt-2 border-t border-card-border/60 flex items-center justify-between text-[11px] font-bold text-primary-light">
                <span>Recommended Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};

export default MarketInsightsView;
