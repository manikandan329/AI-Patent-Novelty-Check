import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Bookmark,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  TrendingUp,
  Cpu,
  Layers,
  Award,
  ArrowRight,
  Zap,
  Globe,
  FileText,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  generateInnovationRecommendations,
  applyRecommendationToVersion,
  getInnovationData,
} from '../../services/ragInnovationEngine';
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import InnovationRoadmapCard from '../../components/dashboard/InnovationRoadmapCard';
import PatentVersioningCard from '../../components/dashboard/PatentVersioningCard';
import toast from 'react-hot-toast';

export const InnovationView = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [innovationData, setInnovationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      const subId = submissionId || 'SUB-2026-98142';
      let data = await getInnovationData(subId);
      if (!data) {
        data = await generateInnovationRecommendations(subId);
      }

      if (isMounted) {
        setInnovationData(data);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [submissionId]);

  const handleAcceptRecommendation = async (recId) => {
    const subId = submissionId || 'SUB-2026-98142';
    const updated = await applyRecommendationToVersion(subId, recId);
    if (updated) {
      setInnovationData(updated);
      toast.success('Recommendation accepted! Patent upgraded to new version snapshot.', { icon: '🚀' });
    }
  };

  const categoriesList = [
    'All',
    'Features to Add',
    'Features to Remove',
    'Features to Improve',
    'Possible Integrations',
    'Alternative Technologies',
    'Commercial Opportunities',
    'Patent Expansion Ideas',
    'Future Scope',
  ];

  const filteredRecs = (innovationData?.recommendations || []).filter((r) => {
    if (activeCategoryFilter === 'All') return true;
    return r.category === activeCategoryFilter;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Sparkles className="w-10 h-10 animate-spin text-primary-light" />
        <p className="text-sm font-semibold text-text-muted">
          Synthesizing RAG Innovation Recommendations & Roadmap...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      
      {/* 1. Innovation Studio Top Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-primary/40 shadow-glow-primary space-y-6 bg-hero-gradient">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">RAG AI Innovation Engine</Badge>
              <span className="text-xs font-mono text-text-subtle">{innovationData?.submissionId}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
              AI Invention Enhancement & Roadmap Studio
            </h1>
            <p className="text-xs text-text-muted max-w-2xl">
              Elevate your patent's inventive step uniqueness through RAG-guided feature modifications, commercial alignment, and version iterations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={FileText}
              onClick={() => navigate(`/dashboard/analysis/${submissionId || 'SUB-2026-98142'}`)}
            >
              View Novelty Report
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={() => toast.success('Regenerated RAG innovation insights')}
              className="shadow-glow-primary"
            >
              Regenerate Suggestions
            </Button>
          </div>
        </div>

        {/* Top 4 Score Telemetry Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-card-border/60">
          <div className="p-3 rounded-2xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-subtle">Innovation Score</span>
            <p className="text-2xl font-mono font-extrabold text-primary-light">
              {innovationData?.innovationScore}%
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-subtle">Novelty Rating</span>
            <p className="text-2xl font-mono font-extrabold text-success">
              {innovationData?.noveltyScore}%
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-subtle">Innovation Potential</span>
            <p className="text-base font-extrabold text-text-main font-mono">Exceptional</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-subtle">Infringement Risk</span>
            <p className="text-base font-extrabold text-success font-mono">Low (0 Conflicts)</p>
          </div>
        </div>
      </div>

      {/* 2. Structured AI Recommendations Grid */}
      <div className="space-y-4">
        
        {/* Category Filter Chips */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary-light" />
            Categorized RAG Patent Recommendations
          </h2>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategoryFilter === cat
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-card border border-card-border text-text-muted hover:text-text-main'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Recommendations Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map((rec) => {
            const isAccepted = rec.status === 'accepted';

            return (
              <motion.div key={rec.id} layout>
                <Card className={`p-5 space-y-4 flex flex-col justify-between h-full border ${isAccepted ? 'border-success/40 bg-success/5' : 'border-card-border'}`}>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={isAccepted ? 'success' : 'primary'} size="sm">
                        {rec.category}
                      </Badge>
                      <span className="text-[10px] font-mono text-text-subtle">{rec.confidence}</span>
                    </div>

                    <h3 className="text-sm font-bold text-text-main leading-snug">{rec.title}</h3>
                    <p className="text-xs text-text-muted leading-relaxed">{rec.description}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border/80 space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-primary-light">Why Suggested:</span>
                    <p className="text-text-muted leading-snug">{rec.whySuggested}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-card-border/60">
                    <span className="text-[11px] font-bold text-success font-mono">{rec.expectedImpact}</span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={isAccepted ? 'success' : 'primary'}
                        size="sm"
                        disabled={isAccepted}
                        icon={isAccepted ? CheckCircle2 : Sparkles}
                        onClick={() => handleAcceptRecommendation(rec.id)}
                        className="text-xs"
                      >
                        {isAccepted ? 'Accepted' : 'Accept Improvement'}
                      </Button>
                    </div>
                  </div>

                </Card>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* 3. Feature Gap Analysis Table */}
      <Card className="p-6 space-y-4">
        <CardHeader className="mb-0">
          <CardTitle>Feature Gap & Overlap Analysis</CardTitle>
          <CardDescription>Direct comparative gap assessment against USPTO & EPO prior art filings</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          
          <div className="p-4 rounded-2xl bg-danger/10 border border-danger/30 space-y-2">
            <h4 className="font-bold text-danger uppercase text-[10px] flex items-center gap-1">
              <MinusCircle className="w-3.5 h-3.5" /> Missing High-Value Features
            </h4>
            <ul className="space-y-1.5 text-text-muted">
              {(innovationData?.featureGap?.missingFeatures || []).map((mf, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-danger font-bold">•</span>
                  <span>{mf}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-warning/10 border border-warning/30 space-y-2">
            <h4 className="font-bold text-warning uppercase text-[10px] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Prior Art Overlapping Concepts
            </h4>
            <ul className="space-y-1.5 text-text-muted">
              {(innovationData?.featureGap?.overlappingFeatures || []).map((of, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-warning font-bold">•</span>
                  <span>{of}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-success/10 border border-success/30 space-y-2">
            <h4 className="font-bold text-success uppercase text-[10px] flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" /> Proprietary Unique Features
            </h4>
            <ul className="space-y-1.5 text-text-muted">
              {(innovationData?.featureGap?.uniqueFeatures || []).map((uf, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-success font-bold">•</span>
                  <span>{uf}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </Card>

      {/* 4. 3-Stage Enhancement Roadmap */}
      <InnovationRoadmapCard roadmap={innovationData?.roadmap || []} />

      {/* 5. Technology Suggestions & Commercial Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Technology Suggestions Matrix */}
        <div className="lg:col-span-7">
          <Card className="p-6 h-full space-y-4">
            <CardHeader className="mb-0">
              <CardTitle>Technology Integration Fit Matrix</CardTitle>
              <CardDescription>Synergistic tech stacks to fortify invention claims</CardDescription>
            </CardHeader>

            <div className="space-y-3 pt-2 text-xs">
              {(innovationData?.technologySuggestions || []).map((tech, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-bold text-text-main">{tech.name}</h4>
                    <p className="text-[11px] text-text-muted truncate">{tech.reason}</p>
                  </div>
                  <Badge variant={tech.fit.includes('High') ? 'success' : 'outline'} size="sm" className="shrink-0">
                    {tech.fit}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Commercial Analysis Metrics */}
        <div className="lg:col-span-5">
          <Card className="p-6 h-full space-y-4">
            <CardHeader className="mb-0">
              <CardTitle>Commercial Readiness & Valuation</CardTitle>
              <CardDescription>Target market valuation and technology readiness level</CardDescription>
            </CardHeader>

            <div className="space-y-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
                <span className="text-[10px] text-text-subtle uppercase">Target Market Size (TAM)</span>
                <p className="text-xl font-extrabold text-success font-mono">
                  {innovationData?.commercialAnalysis?.marketPotential}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
                <span className="text-[10px] text-text-subtle uppercase">Estimated Commercial Valuation</span>
                <p className="text-base font-bold text-text-main">
                  {innovationData?.commercialAnalysis?.commercialValue}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
                <span className="text-[10px] text-text-subtle uppercase">Technology Readiness Level (TRL)</span>
                <p className="text-xs font-mono font-bold text-primary-light">
                  {innovationData?.commercialAnalysis?.technologyReadinessLevel}
                </p>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* 6. Patent Versioning Manager */}
      <PatentVersioningCard versionHistory={innovationData?.versionHistory || []} />

    </div>
  );
};

export default InnovationView;
