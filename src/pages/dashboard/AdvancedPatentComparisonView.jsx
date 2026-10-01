import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCompare,
  Sparkles,
  Layers,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  History,
  Download,
  Info,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  Award,
  ChevronDown,
  ChevronUp,
  FileSearch,
  Zap,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import {
  runAiClaimComparison,
  getClaimComparisonHistory,
  getClaimComparisonById,
  deleteClaimComparison,
  exportComparisonCsv,
  DISCLAIMER_TEXT,
} from '../../services/aiClaimComparisonService';
import { getNoveltyAnalysisHistory } from '../../services/aiPatentNoveltyService';
import { EXTENDED_PATENT_KNOWLEDGE_BASE } from '../../services/patentResearchService';

export const AdvancedPatentComparisonView = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, currentUser } = useAuth();
  const isDemoActive = userProfile?.isDemoMode || currentUser?.isDemo;

  // UI Tabs
  const [activeTab, setActiveTab] = useState('comparison'); // 'comparison' | 'breakdown' | 'history'

  // Input & Selection State
  const [claimsInput, setClaimsInput] = useState('');
  const [selectedPriorArt, setSelectedPriorArt] = useState([
    EXTENDED_PATENT_KNOWLEDGE_BASE[0],
    EXTENDED_PATENT_KNOWLEDGE_BASE[1],
  ]);
  const [module15Analyses, setModule15Analyses] = useState([]);

  // Multi-Step Progress Modal State
  const [isComparing, setIsComparing] = useState(false);
  const [progressState, setProgressState] = useState({ step: 1, message: '', progress: 0 });

  // Current Results & History State
  const [currentComparison, setCurrentComparison] = useState(null);
  const [comparisonHistory, setComparisonHistory] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  // Initial Load
  useEffect(() => {
    loadInitialData();

    // Check location state for pre-selected patents transferred from Module 16
    if (location.state?.selectedPatents && location.state.selectedPatents.length > 0) {
      setSelectedPriorArt(location.state.selectedPatents);
      toast.success(`Imported ${location.state.selectedPatents.length} prior-art patents from Module 16!`);
    }
  }, [location.state]);

  const loadInitialData = async () => {
    const history = await getClaimComparisonHistory();
    setComparisonHistory(history);

    const m15History = await getNoveltyAnalysisHistory();
    setModule15Analyses(m15History);

    // Auto-run default sample comparison if none active
    if (history.length > 0) {
      setCurrentComparison(history[0]);
    } else {
      handleLoadSampleSpec();
    }
  };

  // Load sample specification for demo testing
  const handleLoadSampleSpec = () => {
    const sampleClaims =
      '1. A quantum micro-fluidic neural processing unit comprising a semiconductor substrate, a plurality of dielectric coolant channels, and a gate-oxide integrated laminar flow routing matrix.\n2. The processing unit of claim 1, wherein the dielectric coolant channels have a sub-microliter cross-sectional hydraulic diameter between 50 nm and 200 nm.\n3. The processing unit of claim 1, further comprising a zero-knowledge edge cryptographic key exchange controller configured to encrypt thermal telemetry.';
    setClaimsInput(sampleClaims);
    setSelectedPriorArt([EXTENDED_PATENT_KNOWLEDGE_BASE[0], EXTENDED_PATENT_KNOWLEDGE_BASE[1]]);
  };

  // Toggle Prior Art Patent Selection
  const handleTogglePriorArtSelection = (patent) => {
    const exists = selectedPriorArt.some((p) => (p.patentId || p.id) === (patent.patentId || patent.id));
    if (exists) {
      if (selectedPriorArt.length === 1) {
        toast.error('At least one prior-art patent must be selected for comparison.');
        return;
      }
      setSelectedPriorArt(selectedPriorArt.filter((p) => (p.patentId || p.id) !== (patent.patentId || patent.id)));
    } else {
      if (selectedPriorArt.length >= 4) {
        toast.error('Maximum of 4 prior-art patents can be compared at once.');
        return;
      }
      setSelectedPriorArt([...selectedPriorArt, patent]);
    }
  };

  // Run AI Claim Comparison Trigger
  const handleRunComparison = async () => {
    if (!claimsInput.trim()) {
      toast.error('Please enter or select patent claim text.');
      return;
    }
    if (selectedPriorArt.length === 0) {
      toast.error('Please select at least one prior-art document for comparison.');
      return;
    }

    setIsComparing(true);

    try {
      const output = await runAiClaimComparison(
        claimsInput,
        selectedPriorArt,
        (prog) => setProgressState(prog),
        isDemoActive
      );

      setCurrentComparison(output);
      const updatedHistory = await getClaimComparisonHistory();
      setComparisonHistory(updatedHistory);
      setIsComparing(false);
      setActiveTab('comparison');
      toast.success('Claim Comparison completed!');
    } catch (err) {
      console.error('Comparison error:', err);
      setIsComparing(false);
      toast.error('Comparison failed. Please retry.');
    }
  };

  // Toggle Row Expansion in Table
  const toggleRowExpanded = (idx) => {
    setExpandedRows((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (!currentComparison) return;
    exportComparisonCsv(currentComparison.mappingRows, currentComparison.selectedPatents);
    toast.success('Comparison matrix exported to CSV!');
  };

  // Transfer to Module 15 (Novelty Analysis)
  const handleProceedToNoveltyAnalysis = () => {
    if (!currentComparison) return;
    toast('Transferring claims & comparison state to Module 15 Novelty Analyzer...', { icon: '🚀' });
    navigate('/dashboard/novelty-analysis', {
      state: {
        prefilledPatent: {
          title: 'Claim Comparison Specification',
          claims: currentComparison.claimsInput,
          abstract: `Feature comparison executed against ${currentComparison.selectedPatents.length} prior art documents. Overall claim coverage: ${currentComparison.coverageSummary.coveragePercentage}%.`,
        },
      },
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Top Header & Demo Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-text-main tracking-tight flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-primary-light" />
              Module 17: AI Claim Comparison & Technical Feature Mapping
            </h1>
            {isDemoActive && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1">
            Decompose submitted claims into individual technical elements and map feature-by-feature semantic overlaps against prior-art references.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-[#0F172A] p-1.5 rounded-xl border border-card-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'comparison'
                ? 'bg-primary text-white shadow-md font-bold'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Claim Comparison Matrix
          </button>

          <button
            onClick={() => setActiveTab('breakdown')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'breakdown'
                ? 'bg-primary text-white shadow-md font-bold'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Multi-Patent Breakdown
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-primary text-white shadow-md font-bold'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History ({comparisonHistory.length})
          </button>
        </div>
      </div>

      {/* INPUT & SELECTION CONTROL SECTION */}
      <Card className="p-6 border-primary/30 shadow-glow-primary">
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-card-border/60 pb-4">
            <div>
              <h3 className="text-sm font-bold text-text-main">Claim & Prior-Art Selection Setup</h3>
              <p className="text-xs text-text-muted">Select patent specifications and target prior-art documents to compare.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoadSampleSpec}
              className="text-xs text-primary-light border border-primary/30"
            >
              ⚡ Load Demo Specification
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Claim Input Text */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted flex items-center justify-between">
                <span>Patent Claims Specification Text *</span>
                {module15Analyses.length > 0 && (
                  <select
                    onChange={(e) => {
                      const selected = module15Analyses.find((m) => m.id === e.target.value);
                      if (selected?.claimsRaw) {
                        setClaimsInput(selected.claimsRaw);
                        toast.success('Loaded claims from Module 15 analysis!');
                      }
                    }}
                    className="bg-[#0F172A] border border-card-border rounded-lg text-[10px] text-primary-light p-1 focus:outline-none"
                  >
                    <option value="">Load from Module 15...</option>
                    {module15Analyses.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <textarea
                rows={6}
                value={claimsInput}
                onChange={(e) => setClaimsInput(e.target.value)}
                placeholder="1. A quantum micro-fluidic neural processing unit comprising...&#10;2. The processing unit of claim 1, wherein..."
                className="w-full bg-[#0F172A] border border-card-border rounded-xl p-3 text-xs font-mono text-text-main focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-text-subtle resize-y min-h-[140px]"
              />
            </div>

            {/* Right: Selected Prior Art Documents Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted flex items-center justify-between">
                <span>Selected Prior-Art Documents ({selectedPriorArt.length})</span>
                <span className="text-[10px] text-text-subtle">Pick 1 to 4 documents</span>
              </label>

              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {EXTENDED_PATENT_KNOWLEDGE_BASE.slice(0, 6).map((pat) => {
                  const isChecked = selectedPriorArt.some((p) => (p.patentId || p.id) === (pat.patentId || pat.id));

                  return (
                    <div
                      key={pat.patentId}
                      onClick={() => handleTogglePriorArtSelection(pat)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isChecked
                          ? 'bg-primary/10 border-primary/50 text-text-main font-semibold'
                          : 'bg-[#0F172A] border-card-border text-text-muted hover:border-card-border/80'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-mono text-[10px] text-primary-light font-bold mr-1.5">{pat.patentId}</span>
                        <span className="truncate">{pat.title}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          isChecked ? 'bg-primary text-white' : 'bg-card border border-card-border text-text-subtle'
                        }`}
                      >
                        {isChecked ? 'Selected' : '+ Select'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            icon={Sparkles}
            onClick={handleRunComparison}
            className="w-full py-3 font-bold text-sm shadow-glow-primary"
          >
            Run AI Claim Comparison & Feature Mapping
          </Button>
        </div>
      </Card>

      {/* MULTI-STEP PROGRESS MODAL */}
      <AnimatePresence>
        {isComparing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0F172A]/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-primary/40 text-center space-y-5 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-glow-primary mx-auto">
                <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
                  <GitCompare className="w-7 h-7 text-primary-light animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-text-main">AI Claim & Feature Mapping</h3>
                <p className="text-xs text-text-muted">{progressState.message}</p>
              </div>

              <div className="w-full bg-[#0F172A] rounded-full h-2 border border-card-border overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressState.progress}%` }}
                />
              </div>

              <div className="space-y-1.5 text-left text-xs bg-[#0F172A] p-3 rounded-xl border border-card-border/80">
                <div className={`flex items-center gap-2 ${progressState.step >= 1 ? 'text-success font-semibold' : 'text-text-subtle'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Parsing claim structure & syntax</span>
                </div>
                <div className={`flex items-center gap-2 ${progressState.step >= 2 ? 'text-success font-semibold' : 'text-text-subtle'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>2. Gemini AI technical feature extraction</span>
                </div>
                <div className={`flex items-center gap-2 ${progressState.step >= 3 ? 'text-success font-semibold' : 'text-text-subtle'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. Parsing prior-art specifications</span>
                </div>
                <div className={`flex items-center gap-2 ${progressState.step >= 4 ? 'text-success font-semibold' : 'text-text-subtle'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>4. Computing semantic concept mapping</span>
                </div>
                <div className={`flex items-center gap-2 ${progressState.step >= 5 ? 'text-success font-semibold' : 'text-text-subtle'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>5. Synthesizing AI match explanations</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB 1: CLAIM COMPARISON MATRIX */}
      {activeTab === 'comparison' && currentComparison && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Non-Legal Disclaimer Banner */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-start gap-3 text-xs text-text-muted">
            <Info className="w-5 h-5 text-primary-light shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-text-main block mb-0.5">AI Preliminary Research Assessment</span>
              <span>{currentComparison.disclaimer}</span>
            </div>
          </div>

          {/* CLAIM COVERAGE SUMMARY CARD */}
          <Card className="p-6 border-primary/40 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10">
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-border/60 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-text-main flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary-light" />
                    Overall Claim Coverage Summary
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Strongest reference identified: <b className="text-primary-light">{currentComparison.coverageSummary.strongestPatentId}</b> — {currentComparison.coverageSummary.strongestPatentTitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" icon={Download} onClick={handleExportCsv} className="border-card-border">
                    Export CSV
                  </Button>
                  <Button variant="primary" size="sm" icon={ArrowRight} onClick={handleProceedToNoveltyAnalysis}>
                    Proceed to Module 15 Novelty Analysis
                  </Button>
                </div>
              </div>

              {/* Coverage Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
                  <span className="text-[10px] font-bold uppercase text-text-subtle">Total Features</span>
                  <p className="text-2xl font-bold text-text-main">{currentComparison.coverageSummary.totalFeatures}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0F172A] border border-success/30 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-success">Matched</span>
                  <p className="text-2xl font-bold text-success">{currentComparison.coverageSummary.matchedCount}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0F172A] border border-warning/30 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-warning">Partially Matched</span>
                  <p className="text-2xl font-bold text-warning">{currentComparison.coverageSummary.partialCount}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0F172A] border border-danger/30 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-danger">Not Found (Novel)</span>
                  <p className="text-2xl font-bold text-danger">{currentComparison.coverageSummary.notFoundCount}</p>
                </div>
              </div>

              {/* Visual Coverage Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-text-muted">Claim Coverage Index</span>
                  <span className="text-primary-light font-mono">{currentComparison.coverageSummary.coveragePercentage}%</span>
                </div>
                <div className="w-full bg-[#0F172A] rounded-full h-3 border border-card-border overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-success via-warning to-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${currentComparison.coverageSummary.coveragePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* MAIN COMPARISON MATRIX TABLE */}
          <Card>
            <CardHeader>
              <CardTitle>Feature-by-Feature Prior-Art Mapping Matrix</CardTitle>
              <CardDescription>
                Individual claim element comparison showing match statuses, similarity percentages, and AI explanations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-card-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0F172A] text-text-subtle uppercase font-mono border-b border-card-border">
                    <tr>
                      <th className="p-3.5">Claim #</th>
                      <th className="p-3.5">Technical Feature</th>
                      <th className="p-3.5">Matched Prior Art</th>
                      <th className="p-3.5">Match Status</th>
                      <th className="p-3.5">Similarity</th>
                      <th className="p-3.5">AI Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/60">
                    {currentComparison.mappingRows.map((row, idx) => (
                      <React.Fragment key={idx}>
                        <tr className="hover:bg-card/60 transition-colors cursor-pointer" onClick={() => toggleRowExpanded(idx)}>
                          <td className="p-3.5 font-bold text-primary-light">
                            Claim {row.claimNumber}
                          </td>

                          <td className="p-3.5 font-semibold text-text-main max-w-[200px]">
                            {row.featureName}
                          </td>

                          <td className="p-3.5 font-mono text-text-muted">
                            <span className="font-bold text-primary-light">{row.primaryPatent}</span>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                                row.matchStatus === 'MATCHED'
                                  ? 'bg-success/20 text-success border-success/30'
                                  : row.matchStatus === 'PARTIALLY MATCHED'
                                  ? 'bg-warning/20 text-warning border-warning/30'
                                  : 'bg-danger/20 text-danger border-danger/30'
                              }`}
                            >
                              {row.matchStatus}
                            </span>
                          </td>

                          <td className="p-3.5 font-mono font-bold text-warning">
                            {row.similarityScore}%
                          </td>

                          <td className="p-3.5 text-text-muted max-w-[280px] truncate">
                            {row.aiExplanation}
                          </td>
                        </tr>

                        {/* Expanded Passage & AI Explanation Row */}
                        {expandedRows[idx] && (
                          <tr className="bg-[#0F172A]/90 border-b border-card-border/60">
                            <td colSpan={6} className="p-4 space-y-2">
                              <div className="flex items-start gap-2 text-xs">
                                <Zap className="w-4 h-4 text-primary-light shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-text-main block">Detailed AI Match Rationale</span>
                                  <p className="text-text-muted mt-0.5">{row.aiExplanation}</p>
                                </div>
                              </div>

                              <div className="p-3 rounded-xl bg-[#0B1120] border border-card-border text-[11px] font-mono text-text-subtle">
                                <span className="text-primary-light font-bold block mb-1">Source Patent Supporting Snippet:</span>
                                <span>{row.sourceSnippet}</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* TAB 2: MULTI-PATENT BREAKDOWN */}
      {activeTab === 'breakdown' && currentComparison && (
        <Card>
          <CardHeader>
            <CardTitle>Side-by-Side Multi-Patent Feature Matrix</CardTitle>
            <CardDescription>
              Compares every technical feature across all selected prior-art documents, highlighting strongest reference matches.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-card-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F172A] text-text-subtle uppercase font-mono border-b border-card-border">
                  <tr>
                    <th className="p-3.5">Claim #</th>
                    <th className="p-3.5">Technical Feature</th>
                    {currentComparison.selectedPatents.map((pat) => (
                      <th key={pat.patentId} className="p-3.5 text-center">
                        {pat.patentId}
                      </th>
                    ))}
                    <th className="p-3.5 text-center">Strongest Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/60">
                  {currentComparison.multiPatentComparison.map((item, idx) => (
                    <tr key={idx} className="hover:bg-card/60 transition-colors">
                      <td className="p-3.5 font-bold text-primary-light">Claim {item.claimNumber}</td>
                      <td className="p-3.5 font-semibold text-text-main">{item.featureName}</td>

                      {item.patentBreakdown.map((pb) => (
                        <td key={pb.patentId} className="p-3.5 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-mono font-bold text-warning">{pb.similarityScore}%</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold mt-0.5 ${
                                pb.matchStatus === 'MATCHED'
                                  ? 'bg-success/20 text-success'
                                  : pb.matchStatus === 'PARTIALLY MATCHED'
                                  ? 'bg-warning/20 text-warning'
                                  : 'bg-danger/20 text-danger'
                              }`}
                            >
                              {pb.matchStatus}
                            </span>
                          </div>
                        </td>
                      ))}

                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary-light font-bold font-mono">
                          {item.strongestPatent} ({item.strongestScore}%)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: COMPARISON HISTORY */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Claim Comparison History</CardTitle>
            <CardDescription>
              Archive of completed feature mapping sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {comparisonHistory.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-muted">
                No comparison sessions saved yet. Run a claim comparison to populate history!
              </div>
            ) : (
              <div className="space-y-3">
                {comparisonHistory.map((item) => (
                  <div
                    key={item.comparisonId}
                    className="p-4 rounded-xl glass-card border border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-main">Session #{item.comparisonId}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary-light font-bold font-mono">
                          Coverage: {item.coverageSummary?.coveragePercentage}%
                        </span>
                      </div>
                      <p className="text-[11px] text-text-subtle">
                        Compared against {item.selectedPatents?.length || 2} prior art documents • Features: {item.coverageSummary?.totalFeatures} • Date: {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={ArrowRight}
                        onClick={() => {
                          setCurrentComparison(item);
                          setActiveTab('comparison');
                        }}
                      >
                        Open Session
                      </Button>

                      <button
                        onClick={async () => {
                          await deleteClaimComparison(item.comparisonId);
                          const updated = await getClaimComparisonHistory();
                          setComparisonHistory(updated);
                          toast.success('Session deleted.');
                        }}
                        className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default AdvancedPatentComparisonView;
