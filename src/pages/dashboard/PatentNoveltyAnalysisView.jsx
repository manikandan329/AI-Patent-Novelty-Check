import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  FileSearch,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Layers,
  Search,
  GitCompare,
  History,
  Download,
  Info,
  ArrowRight,
  RefreshCw,
  Award,
  ChevronRight,
  ExternalLink,
  Bot,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import {
  extractTextFromFile,
  runFullPatentNoveltyAnalysis,
  getNoveltyAnalysisHistory,
  getNoveltyAnalysisById,
  DISCLAIMER_TEXT,
} from '../../services/aiPatentNoveltyService';

export const PatentNoveltyAnalysisView = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, currentUser } = useAuth();
  const isDemoActive = userProfile?.isDemoMode || currentUser?.isDemo;

  const [activeTab, setActiveTab] = useState('input'); // 'input' | 'results' | 'history'

  // Input Form State
  const [patentTitle, setPatentTitle] = useState('');
  const [inventorName, setInventorName] = useState(userProfile?.name || 'Dr. Alex Vance');
  const [abstractText, setAbstractText] = useState('');
  const [claimsText, setClaimsText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isExtractingFile, setIsExtractingFile] = useState(false);

  // Analysis Progress Modal State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressState, setProgressState] = useState({ step: 1, message: '', progress: 0 });

  // Current Results & History State
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [resultSubTab, setResultSubTab] = useState('mapping'); // 'mapping' | 'claims' | 'prior-art' | 'explanation' | 'recommendations'

  // Check for location state transferred from Module 16 (Analyze Against This Patent)
  useEffect(() => {
    if (location.state?.prefilledPatent) {
      const p = location.state.prefilledPatent;
      if (p.title) setPatentTitle(p.title);
      if (p.abstract) setAbstractText(p.abstract);
      if (p.claims) setClaimsText(p.claims);
      if (p.inventor) setInventorName(p.inventor);
      toast.success('Prior art specification imported from Module 16!');
    }
  }, [location.state]);

  // Load history & initial analysis if analysisId present
  useEffect(() => {
    loadHistory();
    if (analysisId) {
      loadAnalysisById(analysisId);
    }
  }, [analysisId]);

  const loadHistory = async () => {
    const list = await getNoveltyAnalysisHistory();
    setAnalysisHistory(list);
  };

  const loadAnalysisById = async (id) => {
    const item = await getNoveltyAnalysisById(id);
    if (item) {
      setCurrentAnalysis(item);
      setActiveTab('results');
    }
  };

  // Pre-fill sample data for Quick Demo
  const handleLoadSampleData = () => {
    setPatentTitle('Quantum Micro-Fluidic Neural Processing Unit');
    setInventorName('Demo User (Researcher)');
    setAbstractText(
      'A quantum micro-fluidic neural processing unit comprising a semiconductor substrate, a plurality of sub-nanometer dielectric coolant channels, and a gate-oxide integrated laminar flow routing matrix for zero-latency thermal management.'
    );
    setClaimsText(
      '1. A quantum micro-fluidic neural processing unit comprising a semiconductor substrate, a plurality of dielectric coolant channels, and a gate-oxide integrated laminar flow routing matrix.\n2. The processing unit of claim 1, wherein the dielectric coolant channels have a sub-microliter cross-sectional hydraulic diameter between 50 nm and 200 nm.\n3. The processing unit of claim 1, further comprising a zero-knowledge edge cryptographic key exchange controller configured to encrypt thermal telemetry.'
    );
    toast.success('Sample patent specification loaded!');
  };

  // File Upload Text Extraction Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsExtractingFile(true);
    toast('Extracting patent claims & sections...', { icon: '📄' });

    const res = await extractTextFromFile(file);
    setIsExtractingFile(false);

    if (res.success) {
      const { parsedSections, rawText } = res;
      if (parsedSections.title) setPatentTitle(parsedSections.title);
      if (parsedSections.abstract) setAbstractText(parsedSections.abstract);
      if (parsedSections.claims) setClaimsText(parsedSections.claims);
      else if (rawText) setClaimsText(rawText);

      toast.success('Patent text extracted successfully!');
    } else {
      toast.error(res.error || 'Could not parse document text.');
    }
  };

  // Submit & Run Analysis
  const handleRunAnalysis = async (e) => {
    e.preventDefault();

    if (!patentTitle.trim()) {
      toast.error('Please enter a Patent Title.');
      return;
    }
    if (!abstractText.trim() && !claimsText.trim()) {
      toast.error('Please enter abstract or patent claims to analyze.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const inputObj = {
        title: patentTitle,
        inventor: inventorName,
        abstract: abstractText,
        claims: claimsText,
      };

      const result = await runFullPatentNoveltyAnalysis(
        inputObj,
        (prog) => setProgressState(prog),
        isDemoActive
      );

      setCurrentAnalysis(result);
      await loadHistory();
      setIsAnalyzing(false);
      setActiveTab('results');
      toast.success('Novelty Analysis completed!');
    } catch (err) {
      console.error('Analysis error:', err);
      setIsAnalyzing(false);
      toast.error('Analysis failed. Please check inputs and retry.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Top Header & Demo Mode Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-text-main tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-light fill-primary/20" />
              Module 15: AI Patent Novelty Analysis
            </h1>
            {isDemoActive && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1">
            Compare submitted claim structures against prior-art corpora to derive semantic feature mappings & novelty scores.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-[#0F172A] p-1.5 rounded-xl border border-card-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'input'
                ? 'bg-primary text-white shadow-md font-bold'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            Patent Input
          </button>

          <button
            onClick={() => {
              if (!currentAnalysis) {
                toast.error('No analysis generated yet. Run a patent analysis first.');
                return;
              }
              setActiveTab('results');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'results'
                ? 'bg-primary text-white shadow-md font-bold'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Analysis Results
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
            History ({analysisHistory.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PATENT INPUT FORM */}
      {activeTab === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Patent Specification & Claims Input</CardTitle>
                  <CardDescription>
                    Enter invention details manually or upload a specification document (PDF/TXT).
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadSampleData}
                  className="text-xs text-primary-light hover:bg-primary/10 border border-primary/30"
                >
                  ⚡ Load Sample Data
                </Button>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleRunAnalysis} className="space-y-5">
                  <Input
                    label="Patent Title *"
                    placeholder="e.g. Quantum Micro-Fluidic Neural Processing Unit"
                    value={patentTitle}
                    onChange={(e) => setPatentTitle(e.target.value)}
                    required
                  />

                  <Input
                    label="Inventor / Applicant Name"
                    placeholder="e.g. Dr. Alex Vance / Patentiq AI Labs"
                    value={inventorName}
                    onChange={(e) => setInventorName(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted flex items-center justify-between">
                      <span>Abstract / Executive Summary</span>
                      <span className="text-[10px] text-text-subtle">Recommended</span>
                    </label>
                    <textarea
                      rows={3}
                      value={abstractText}
                      onChange={(e) => setAbstractText(e.target.value)}
                      placeholder="Paste brief technical abstract describing the problem and core solution..."
                      className="w-full rounded-xl bg-[#0F172A] border border-card-border p-3 text-xs text-text-main focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-text-subtle resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted flex items-center justify-between">
                      <span>Patent Claims *</span>
                      <span className="text-[10px] text-text-subtle">Independent & Dependent Claims</span>
                    </label>
                    <textarea
                      rows={6}
                      value={claimsText}
                      onChange={(e) => setClaimsText(e.target.value)}
                      placeholder="1. A quantum micro-fluidic neural processing unit comprising...&#10;2. The processing unit of claim 1, wherein..."
                      className="w-full rounded-xl bg-[#0F172A] border border-card-border p-3 text-xs text-text-main font-mono focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-text-subtle resize-y min-h-[140px]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={Sparkles}
                    className="w-full py-3 font-bold text-sm shadow-glow-primary mt-2"
                  >
                    Analyze Patent Novelty
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: PDF File Upload & Guidance */}
          <div className="space-y-6">
            
            {/* Drag & Drop File Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">PDF Document Upload</CardTitle>
                <CardDescription className="text-xs">
                  Upload PDF or text file to extract sections automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="border-2 border-dashed border-card-border hover:border-primary/50 bg-[#0F172A] rounded-2xl p-6 text-center cursor-pointer block transition-all">
                  <input
                    type="file"
                    accept=".pdf,.txt,.md,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-xl bg-card border border-card-border flex items-center justify-center mx-auto mb-2 text-primary-light shadow-md">
                    <UploadCloud className="w-6 h-6 animate-bounce" />
                  </div>
                  <p className="text-xs font-bold text-text-main">
                    {isExtractingFile ? 'Extracting File Contents...' : 'Click or Drag PDF File'}
                  </p>
                  <p className="text-[10px] text-text-subtle mt-1">
                    Supports PDF, TXT, MD, DOCX up to 15MB
                  </p>
                </label>

                {uploadedFile && (
                  <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-primary-light shrink-0" />
                      <span className="truncate text-text-main font-semibold">{uploadedFile.name}</span>
                    </div>
                    <span className="text-[10px] text-success font-bold shrink-0">Loaded</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workflow Guidance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary-light" />
                  Analysis Workflow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-text-muted">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    <b>Gemini AI Claims Breakdown:</b> Splits claims into independent technical features.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    <b>Vector Prior Art Search:</b> Compares features against 140M+ USPTO and WIPO records.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    <b>Claim-to-Prior-Art Mapping:</b> Identifies exact overlapping elements vs novel distinctions.
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      )}

      {/* MULTI-STEP PROGRESS MODAL */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0F172A]/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-2xl border border-primary/40 shadow-2xl space-y-6 text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-glow-primary mx-auto">
                <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary-light animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-text-main">AI Patent Novelty Analysis</h3>
                <p className="text-xs text-text-muted">{progressState.message}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-[#0F172A] rounded-full h-2.5 border border-card-border overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressState.progress}%` }}
                  />
                </div>
                <p className="text-[10px] font-mono text-primary-light text-right">{progressState.progress}% Completed</p>
              </div>

              {/* Steps Checklist */}
              <div className="space-y-2 text-left text-xs bg-[#0F172A] p-4 rounded-xl border border-card-border/80">
                <div className={`flex items-center gap-2 ${progressState.step >= 1 ? 'text-success font-semibold' : 'text-text-subtle'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Parsing patent text & claim structure</span>
                </div>
                <div className={`flex items-center gap-2 ${progressState.step >= 2 ? 'text-success font-semibold' : 'text-text-subtle'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>2. Gemini AI feature extraction</span>
                </div>
                <div className={`flex items-center gap-2 ${progressState.step >= 3 ? 'text-success font-semibold' : 'text-text-subtle'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. Searching prior-art vector corpus</span>
                </div>
                <div className={`flex items-center gap-2 ${progressState.step >= 4 ? 'text-success font-semibold' : 'text-text-subtle'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>4. Computing claim-to-prior-art mapping</span>
                </div>
                <div className={`flex items-center gap-2 ${progressState.step >= 5 ? 'text-success font-semibold' : 'text-text-subtle'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>5. Synthesizing novelty assessment</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB 2: ANALYSIS RESULTS DASHBOARD */}
      {activeTab === 'results' && currentAnalysis && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Non-Legal Disclaimer Banner */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-start gap-3 text-xs text-text-muted">
            <Info className="w-5 h-5 text-primary-light shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-text-main block mb-0.5">AI Preliminary Research Assessment</span>
              <span>{currentAnalysis.disclaimer}</span>
            </div>
          </div>

          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Novelty Score Card */}
            <div className="glass-card p-5 rounded-2xl border border-primary/40 space-y-2 relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent">
              <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">Novelty Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-text-main">{currentAnalysis.noveltyScore}%</span>
                <Badge variant={currentAnalysis.badgeVariant} size="sm">
                  {currentAnalysis.noveltyStatus}
                </Badge>
              </div>
              <p className="text-[10px] text-text-muted">Calculated relative to retrieved prior art</p>
            </div>

            {/* Similarity Score */}
            <div className="glass-card p-5 rounded-2xl border border-card-border space-y-2">
              <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">Prior Art Overlap</span>
              <div className="text-3xl font-extrabold text-warning">
                {currentAnalysis.overallSimilarityScore}%
              </div>
              <p className="text-[10px] text-text-muted">Highest similarity reference</p>
            </div>

            {/* Confidence Level */}
            <div className="glass-card p-5 rounded-2xl border border-card-border space-y-2">
              <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">Confidence Level</span>
              <div className="text-sm font-bold text-success flex items-center gap-1.5 pt-2">
                <Award className="w-4 h-4" />
                <span>{currentAnalysis.confidenceLevel}</span>
              </div>
              <p className="text-[10px] text-text-muted">Gemini RAG vector match reliability</p>
            </div>

            {/* Claims Count */}
            <div className="glass-card p-5 rounded-2xl border border-card-border space-y-2">
              <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">Claims Analyzed</span>
              <div className="text-3xl font-extrabold text-primary-light">
                {currentAnalysis.claimsAnalyzedCount}
              </div>
              <p className="text-[10px] text-text-muted">Independent & dependent elements</p>
            </div>

            {/* Relevant Prior Art Matches */}
            <div className="glass-card p-5 rounded-2xl border border-card-border space-y-2">
              <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">Prior Art Matches</span>
              <div className="text-3xl font-extrabold text-secondary-light">
                {currentAnalysis.relevantPriorArtCount}
              </div>
              <p className="text-[10px] text-text-muted">Cited patent documents</p>
            </div>

          </div>

          {/* Sub-Navigation Tabs inside Results */}
          <div className="flex items-center gap-2 border-b border-card-border/60 pb-3 overflow-x-auto">
            <button
              onClick={() => setResultSubTab('mapping')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                resultSubTab === 'mapping'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text-main bg-card'
              }`}
            >
              Claim-to-Prior-Art Mapping
            </button>

            <button
              onClick={() => setResultSubTab('claims')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                resultSubTab === 'claims'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text-main bg-card'
              }`}
            >
              Claim Analysis
            </button>

            <button
              onClick={() => setResultSubTab('prior-art')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                resultSubTab === 'prior-art'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text-main bg-card'
              }`}
            >
              Prior-Art Matches ({currentAnalysis.priorArtMatches.length})
            </button>

            <button
              onClick={() => setResultSubTab('explanation')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                resultSubTab === 'explanation'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text-main bg-card'
              }`}
            >
              AI Explanation & Rationale
            </button>

            <button
              onClick={() => setResultSubTab('recommendations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                resultSubTab === 'recommendations'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text-main bg-card'
              }`}
            >
              Recommendations
            </button>
          </div>

          {/* SUB-TAB 1: CLAIM-TO-PRIOR-ART MAPPING TREE */}
          {resultSubTab === 'mapping' && (
            <Card>
              <CardHeader>
                <CardTitle>Semantic Claim-to-Prior-Art Mapping Hierarchy</CardTitle>
                <CardDescription>
                  Detailed feature-by-feature mapping illustrating exact prior-art overlaps versus novel inventive distinctions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentAnalysis.claimMapping.map((claimMap) => (
                  <div
                    key={claimMap.claimNumber}
                    className="p-5 rounded-2xl bg-[#0F172A] border border-card-border space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary-light text-xs font-extrabold">
                          Claim {claimMap.claimNumber}
                        </span>
                        <span className="text-xs font-semibold text-text-muted">({claimMap.claimType})</span>
                      </div>
                    </div>

                    <p className="text-xs text-text-main font-mono bg-[#0B1120] p-3 rounded-xl border border-card-border/50">
                      "{claimMap.claimText}"
                    </p>

                    {/* Features Mapping Tree */}
                    <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-primary/30">
                      {claimMap.featureMappings.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-3.5 rounded-xl glass-card border border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary" />
                              <span className="text-xs font-bold text-text-main">{feat.featureName}</span>
                            </div>
                            <p className="text-[11px] text-text-subtle">
                              Matched Patent: <b className="text-text-muted">{feat.matchedPatent}</b> — {feat.matchedTitle}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs font-mono font-bold text-warning">{feat.similarityScore}% Overlap</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                feat.matchType.includes('Distinctive')
                                  ? 'bg-success/20 text-success border-success/30'
                                  : feat.matchType.includes('Exact')
                                  ? 'bg-danger/20 text-danger border-danger/30'
                                  : 'bg-warning/20 text-warning border-warning/30'
                              }`}
                            >
                              {feat.matchType}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* SUB-TAB 2: CLAIM ANALYSIS */}
          {resultSubTab === 'claims' && (
            <Card>
              <CardHeader>
                <CardTitle>Independent & Dependent Claims Breakdown</CardTitle>
                <CardDescription>
                  Extracted technical features and scope elements per claim.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentAnalysis.claimsList.map((claim) => (
                  <div key={claim.id} className="p-5 rounded-2xl bg-[#0F172A] border border-card-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary-light">
                        Claim {claim.number} — {claim.type}
                      </span>
                    </div>
                    <p className="text-xs text-text-main font-mono leading-relaxed bg-[#0B1120] p-3 rounded-xl">
                      {claim.text}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">
                        Extracted Technical Features:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {claim.features.map((f, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-card border border-card-border text-[11px] text-text-muted"
                          >
                            • {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* SUB-TAB 3: PRIOR ART MATCHES */}
          {resultSubTab === 'prior-art' && (
            <Card>
              <CardHeader>
                <CardTitle>Relevant Prior-Art Patent References</CardTitle>
                <CardDescription>
                  Retrieved prior-art records from USPTO, EPO, and WIPO vector database.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentAnalysis.priorArtMatches.map((patent) => (
                  <div key={patent.id} className="p-5 rounded-2xl bg-[#0F172A] border border-card-border space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-card-border/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-text-main">{patent.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-card border border-card-border text-primary-light">
                            {patent.patentNumber}
                          </span>
                        </div>
                        <p className="text-xs text-text-subtle mt-0.5">
                          Applicant: {patent.applicant} • Pub Date: {patent.publicationDate} • Source: {patent.source}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-subtle">Similarity:</span>
                        <span className="text-lg font-bold text-warning">{patent.similarityScore}%</span>
                      </div>
                    </div>

                    <p className="text-xs text-text-muted leading-relaxed">{patent.abstract}</p>

                    <div className="pt-2 space-y-1">
                      <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">
                        Relevant Matching Features:
                      </span>
                      <ul className="list-disc list-inside text-xs text-text-muted space-y-1">
                        {patent.relevantMatchingFeatures.map((feat, idx) => (
                          <li key={idx}>{feat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* SUB-TAB 4: AI EXPLANATION & RATIONALE */}
          {resultSubTab === 'explanation' && (
            <Card>
              <CardHeader>
                <CardTitle>AI Novelty Rationale & Feature Synthesis</CardTitle>
                <CardDescription>
                  Gemini AI detailed explanation of novel distinctions versus prior art disclosures.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 space-y-2">
                  <h4 className="text-xs font-bold text-primary-light flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    Overall Novelty Rationale
                  </h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {currentAnalysis.aiExplanation.noveltyRationale}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Distinctive Features */}
                  <div className="p-4 rounded-xl bg-success/10 border border-success/30 space-y-3">
                    <h4 className="text-xs font-bold text-success flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Distinctive & Novel Features
                    </h4>
                    <ul className="space-y-2">
                      {currentAnalysis.aiExplanation.distinctiveFeatures.map((f, i) => (
                        <li key={i} className="text-xs text-text-muted flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Disclosed Features */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                    <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Prior-Art Disclosed Elements
                    </h4>
                    <ul className="space-y-2">
                      {currentAnalysis.aiExplanation.disclosedFeatures.map((f, i) => (
                        <li key={i} className="text-xs text-text-muted flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SUB-TAB 5: RECOMMENDATIONS */}
          {resultSubTab === 'recommendations' && (
            <Card glow={true}>
              <CardHeader>
                <CardTitle>Strategic Patent Filing & Claim Recommendations</CardTitle>
                <CardDescription>
                  Actionable steps to maximize patentability and circumvent prior-art overlaps.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentAnalysis.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0F172A] border border-card-border flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary-light font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-text-main leading-relaxed pt-0.5">{rec}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        </div>
      )}

      {/* TAB 3: ANALYSIS HISTORY */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Novelty Analysis History</CardTitle>
            <CardDescription>
              Archive of previously completed AI patent novelty assessments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysisHistory.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-muted">
                No novelty analyses performed yet. Use the Patent Input tab to run your first evaluation!
              </div>
            ) : (
              <div className="space-y-3">
                {analysisHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl glass-card border border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-text-main">{item.title}</span>
                        <Badge variant={item.badgeVariant} size="sm">
                          {item.noveltyStatus} ({item.noveltyScore}%)
                        </Badge>
                      </div>
                      <p className="text-xs text-text-subtle">
                        Inventor: {item.inventor} • Date: {new Date(item.analysisDate).toLocaleDateString()} • Prior Art Matches: {item.relevantPriorArtCount}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={ArrowRight}
                      onClick={() => {
                        setCurrentAnalysis(item);
                        setActiveTab('results');
                      }}
                      className="shrink-0"
                    >
                      View Report
                    </Button>
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

export default PatentNoveltyAnalysisView;
