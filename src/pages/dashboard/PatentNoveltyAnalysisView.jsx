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
  Layers,
  History,
  Info,
  ArrowRight,
  Award,
  Bot,
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
} from '../../services/aiPatentNoveltyService';

export const PatentNoveltyAnalysisView = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, currentUser } = useAuth();
  const isDemoActive = userProfile?.isDemoMode || currentUser?.isDemo;

  const [activeTab, setActiveTab] = useState('input');

  const [patentTitle, setPatentTitle] = useState('');
  const [inventorName, setInventorName] = useState(userProfile?.name || 'Dr. Alex Vance');
  const [abstractText, setAbstractText] = useState('');
  const [claimsText, setClaimsText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isExtractingFile, setIsExtractingFile] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressState, setProgressState] = useState({
    step: 1,
    message: '',
    progress: 0,
  });

  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [resultSubTab, setResultSubTab] = useState('mapping');

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

  useEffect(() => {
    loadHistory();

    if (analysisId) {
      loadAnalysisById(analysisId);
    }
  }, [analysisId]);

  const loadHistory = async () => {
    try {
      const list = await getNoveltyAnalysisHistory();
      setAnalysisHistory(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('History loading error:', error);
      setAnalysisHistory([]);
    }
  };

  const loadAnalysisById = async (id) => {
    try {
      const item = await getNoveltyAnalysisById(id);

      if (item) {
        setCurrentAnalysis(item);
        setActiveTab('results');
      }
    } catch (error) {
      console.error('Analysis loading error:', error);
    }
  };

  const handleLoadSampleData = () => {
    setPatentTitle('AI Based Smart Traffic Monitoring System');
    setInventorName('Demo User (Researcher)');

    setAbstractText(
      'A system for monitoring road traffic using artificial intelligence and computer vision to detect vehicles, analyze traffic conditions, and identify congestion in real time.'
    );

    setClaimsText(
      '1. An artificial intelligence based traffic monitoring system comprising a camera module, a processing unit, and a traffic analysis module configured to detect vehicles and monitor road traffic conditions.\n2. The system of claim 1, wherein the processing unit uses computer vision techniques to identify traffic congestion in real time.\n3. The system of claim 1, further comprising a notification module configured to generate alerts based on detected traffic conditions.'
    );

    toast.success('Sample patent specification loaded!');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploadedFile(file);
    setIsExtractingFile(true);

    toast('Extracting patent sections...', {
      icon: '📄',
    });

    try {
      const res = await extractTextFromFile(file);

      setIsExtractingFile(false);

      if (res.success) {
        const { parsedSections, rawText } = res;

        if (parsedSections.title) {
          setPatentTitle(parsedSections.title);
        }

        if (parsedSections.abstract) {
          setAbstractText(parsedSections.abstract);
        }

        if (parsedSections.claims) {
          setClaimsText(parsedSections.claims);
        } else if (rawText) {
          setClaimsText(rawText);
        }

        toast.success('Patent text extracted successfully!');
      } else {
        toast.error(res.error || 'Could not parse document text.');
      }
    } catch (error) {
      setIsExtractingFile(false);
      console.error('File extraction error:', error);
      toast.error('Could not extract patent document.');
    }
  };

  const handleRunAnalysis = async (e) => {
    e.preventDefault();

    if (!patentTitle.trim()) {
      toast.error('Please enter a Patent Title.');
      return;
    }

    if (!abstractText.trim()) {
      toast.error('Please enter a Patent Abstract for ML analysis.');
      return;
    }

    setIsAnalyzing(true);

    setProgressState({
      step: 1,
      message: 'Validating patent title and abstract...',
      progress: 20,
    });

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

      setProgressState({
        step: 5,
        message: 'Preliminary ML screening completed.',
        progress: 100,
      });

      setCurrentAnalysis(result);

      await loadHistory();

      setIsAnalyzing(false);
      setActiveTab('results');
      setResultSubTab('prior-art');

      toast.success('ML Patent Screening completed!');
    } catch (err) {
      console.error('Analysis error:', err);

      setIsAnalyzing(false);

      toast.error(
        err?.message ||
          'Analysis failed. Please make sure the ML backend is running.'
      );
    }
  };

  const screeningResult = currentAnalysis?.noveltyStatus || 'UNKNOWN';

  const getScreeningBadgeVariant = () => {
    if (screeningResult.includes('LOW')) return 'success';
    if (screeningResult.includes('MODERATE')) return 'warning';
    if (screeningResult.includes('HIGH')) return 'danger';
    return 'primary';
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">

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
            ML-assisted preliminary screening of patent documents against a trained patent dataset.
          </p>
        </div>

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

      {activeTab === 'input' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Patent Specification & Claims Input</CardTitle>
                  <CardDescription>
                    Enter the patent title and abstract for ML-based preliminary screening.
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
                    placeholder="e.g. AI Based Smart Traffic Monitoring System"
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
                      <span>Abstract / Executive Summary *</span>
                      <span className="text-[10px] text-primary-light">
                        Required for ML screening
                      </span>
                    </label>

                    <textarea
                      rows={5}
                      value={abstractText}
                      onChange={(e) => setAbstractText(e.target.value)}
                      placeholder="Paste the technical abstract describing the problem, system, method, and core solution..."
                      className="w-full rounded-xl bg-[#0F172A] border border-card-border p-3 text-xs text-text-main focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-text-subtle resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted flex items-center justify-between">
                      <span>Patent Claims</span>
                      <span className="text-[10px] text-text-subtle">
                        Used for display and future claim-level analysis
                      </span>
                    </label>

                    <textarea
                      rows={6}
                      value={claimsText}
                      onChange={(e) => setClaimsText(e.target.value)}
                      placeholder="1. A system comprising...&#10;2. The system of claim 1, wherein..."
                      className="w-full rounded-xl bg-[#0F172A] border border-card-border p-3 text-xs text-text-main font-mono focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-text-subtle resize-y min-h-[140px]"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-[11px] text-text-muted">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-primary-light shrink-0 mt-0.5" />
                      <span>
                        The current ML model performs document-level screening using the
                        patent title and abstract. It does not make a legal novelty
                        determination or perform true claim-level anticipation analysis.
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={Sparkles}
                    className="w-full py-3 font-bold text-sm shadow-glow-primary mt-2"
                  >
                    Run ML Patent Screening
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">
                  Patent Document Upload
                </CardTitle>

                <CardDescription className="text-xs">
                  Upload a patent document to extract title, abstract and claims.
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
                    {isExtractingFile
                      ? 'Extracting File Contents...'
                      : 'Click or Drag Patent File'}
                  </p>

                  <p className="text-[10px] text-text-subtle mt-1">
                    Supports PDF, TXT, MD, DOCX up to 15MB
                  </p>
                </label>

                {uploadedFile && (
                  <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-primary-light shrink-0" />
                      <span className="truncate text-text-main font-semibold">
                        {uploadedFile.name}
                      </span>
                    </div>

                    <span className="text-[10px] text-success font-bold shrink-0">
                      Loaded
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary-light" />
                  ML Analysis Workflow
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 text-xs text-text-muted">

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>

                  <p>
                    <b>Patent Text Processing:</b> Validates and prepares the submitted title and abstract.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>

                  <p>
                    <b>TF-IDF Feature Transformation:</b> Converts the patent text into numerical features using trained vectorizers.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>

                  <p>
                    <b>Prior-Art Retrieval:</b> Searches the trained index containing 11,532 patent records.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    4
                  </span>

                  <p>
                    <b>ML Relatedness Analysis:</b> Applies the trained Logistic Regression model using multiple similarity features.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary-light flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    5
                  </span>

                  <p>
                    <b>Preliminary Screening Report:</b> Presents the highest similarity and retrieved prior-art records.
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      )}

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
                <h3 className="text-xl font-bold text-text-main">
                  ML Patent Novelty Screening
                </h3>

                <p className="text-xs text-text-muted">
                  {progressState.message}
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-[#0F172A] rounded-full h-2.5 border border-card-border overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progressState.progress}%`,
                    }}
                  />
                </div>

                <p className="text-[10px] font-mono text-primary-light text-right">
                  {progressState.progress}% Completed
                </p>
              </div>

              <div className="space-y-2 text-left text-xs bg-[#0F172A] p-4 rounded-xl border border-card-border/80">

                <div
                  className={`flex items-center gap-2 ${
                    progressState.step >= 1
                      ? 'text-success font-semibold'
                      : 'text-text-subtle'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Validating patent text</span>
                </div>

                <div
                  className={`flex items-center gap-2 ${
                    progressState.step >= 2
                      ? 'text-success font-semibold'
                      : 'text-text-subtle'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>2. Applying TF-IDF transformation</span>
                </div>

                <div
                  className={`flex items-center gap-2 ${
                    progressState.step >= 3
                      ? 'text-success font-semibold'
                      : 'text-text-subtle'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. Searching patent records</span>
                </div>

                <div
                  className={`flex items-center gap-2 ${
                    progressState.step >= 4
                      ? 'text-success font-semibold'
                      : 'text-text-subtle'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>4. Applying Logistic Regression model</span>
                </div>

                <div
                  className={`flex items-center gap-2 ${
                    progressState.step >= 5
                      ? 'text-success font-semibold'
                      : 'text-text-subtle'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>5. Preparing screening report</span>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'results' && currentAnalysis && (
        <div className="space-y-8 animate-fadeIn">

          <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex items-start gap-3 text-xs text-text-muted">
            <Info className="w-5 h-5 text-primary-light shrink-0 mt-0.5" />

            <div>
              <span className="font-bold text-text-main block mb-0.5">
                AI/ML Preliminary Research Assessment
              </span>

              <span>
                {currentAnalysis.disclaimer ||
                  'This system provides AI-assisted preliminary screening and is not a legal patent novelty determination.'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

            <div className="glass-card p-5 rounded-2xl border border-primary/40 space-y-2 relative overflow-hidden bg-gradient-to-b from-primary/10 to-transparent">
              <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">
                Preliminary Screening
              </span>

              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-text-main">
                  {currentAnalysis.noveltyStatus || 'UNKNOWN'}
                </span>
              </div>

              <p className="text-[10px] text-text-muted">
                Document-level ML screening result
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-card-border space-y-2">
              <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">
                Highest Similarity
              </span>

              <div className="text-3xl font-extrabold text-warning">
                {currentAnalysis.overallSimilarityScore ?? 0}%
              </div>

              <p className="text-[10px] text-text-muted">
                Highest retrieved document similarity
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-card-border space-y-2">
              <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">
                ML Model
              </span>

              <div className="text-sm font-bold text-success flex items-center gap-1.5 pt-2">
                <Award className="w-4 h-4" />
                <span>Logistic Regression</span>
              </div>

              <p className="text-[10px] text-text-muted">
                Trained multi-feature relatedness model
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-card-border space-y-2">
              <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">
                Claims Analyzed
              </span>

              <div className="text-3xl font-extrabold text-primary-light">
                {currentAnalysis.claimsAnalyzedCount ?? 0}
              </div>

              <p className="text-[10px] text-text-muted">
                Claims parsed from submitted input
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-card-border space-y-2">
              <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">
                Prior Art Matches
              </span>

              <div className="text-3xl font-extrabold text-secondary-light">
                {currentAnalysis.relevantPriorArtCount ??
                  currentAnalysis.priorArtMatches?.length ??
                  0}
              </div>

              <p className="text-[10px] text-text-muted">
                Retrieved patent records
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 border-b border-card-border/60 pb-3 overflow-x-auto">

            <button
              onClick={() => setResultSubTab('mapping')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                resultSubTab === 'mapping'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text-main bg-card'
              }`}
            >
              Screening Evidence
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
              Prior-Art Matches ({currentAnalysis.priorArtMatches?.length ?? 0})
            </button>

            <button
              onClick={() => setResultSubTab('explanation')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                resultSubTab === 'explanation'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text-main bg-card'
              }`}
            >
              ML Explanation
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

          {resultSubTab === 'mapping' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Document-Level Screening Evidence
                </CardTitle>

                <CardDescription>
                  The current ML model compares the submitted title and abstract against retrieved patent records. This section does not represent claim-level legal anticipation.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">

                {currentAnalysis.claimMapping?.length > 0 ? (
                  currentAnalysis.claimMapping.map((claimMap) => (
                    <div
                      key={claimMap.claimNumber}
                      className="p-5 rounded-2xl bg-[#0F172A] border border-card-border space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-card-border/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary-light text-xs font-extrabold">
                            Claim {claimMap.claimNumber}
                          </span>

                          <span className="text-xs font-semibold text-text-muted">
                            ({claimMap.claimType})
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-text-main font-mono bg-[#0B1120] p-3 rounded-xl border border-card-border/50">
                        "{claimMap.claimText}"
                      </p>

                      <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-primary-light shrink-0 mt-0.5" />

                          <div className="space-y-1">
                            <p className="text-xs font-bold text-text-main">
                              Document-Level Evidence
                            </p>

                            <p className="text-[11px] text-text-muted">
                              {claimMap.featureMappings?.[0]?.featureName ||
                                'This claim was not independently evaluated by the current document-level ML model.'}
                            </p>

                            {claimMap.featureMappings?.[0] && (
                              <p className="text-[11px] text-text-muted">
                                Highest retrieved document:{' '}
                                <b className="text-text-main">
                                  {claimMap.featureMappings[0].matchedPatent}
                                </b>{' '}
                                — {claimMap.featureMappings[0].matchedTitle}
                              </p>
                            )}

                            {claimMap.featureMappings?.[0] && (
                              <p className="text-[11px] text-warning font-semibold">
                                Document similarity:{' '}
                                {claimMap.featureMappings[0].similarityScore}%
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-xl bg-[#0F172A] border border-card-border text-center">
                    <Info className="w-6 h-6 text-primary-light mx-auto mb-2" />

                    <p className="text-xs text-text-muted">
                      Claim-level mapping is not available in the current ML model.
                      The model currently performs title and abstract document-level
                      similarity screening.
                    </p>
                  </div>
                )}

              </CardContent>
            </Card>
          )}

          {resultSubTab === 'claims' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Patent Claims Breakdown
                </CardTitle>

                <CardDescription>
                  Parsed claims and extracted text features. These claims are displayed for reference and are not independently classified by the current ML model.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">

                {currentAnalysis.claimsList?.length > 0 ? (
                  currentAnalysis.claimsList.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-5 rounded-2xl bg-[#0F172A] border border-card-border space-y-3"
                    >
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
                          {claim.features?.map((f, i) => (
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
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-text-muted">
                    No claims were provided.
                  </div>
                )}

              </CardContent>
            </Card>
          )}

          {resultSubTab === 'prior-art' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Relevant Prior-Art Patent References
                </CardTitle>

                <CardDescription>
                  Retrieved records from the trained HUPD patent dataset used by the ML screening pipeline.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">

                {currentAnalysis.priorArtMatches?.length > 0 ? (
                  currentAnalysis.priorArtMatches.map((patent) => (
                    <div
                      key={patent.id}
                      className="p-5 rounded-2xl bg-[#0F172A] border border-card-border space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-card-border/60 pb-3">

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-text-main">
                              {patent.title}
                            </span>

                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-card border border-card-border text-primary-light">
                              {patent.patentNumber}
                            </span>
                          </div>

                          <p className="text-xs text-text-subtle mt-0.5">
                            Source: {patent.source || 'HUPD patent dataset'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-subtle">
                            Similarity:
                          </span>

                          <span className="text-lg font-bold text-warning">
                            {patent.similarityScore}%
                          </span>
                        </div>

                      </div>

                      <p className="text-xs text-text-muted leading-relaxed">
                        {patent.abstract ||
                          'Abstract not available for this retrieved record.'}
                      </p>

                      <div className="pt-2 space-y-1">
                        <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">
                          ML Similarity Evidence:
                        </span>

                        <ul className="list-disc list-inside text-xs text-text-muted space-y-1">
                          {patent.relevantMatchingFeatures?.map((feat, idx) => (
                            <li key={idx}>{feat}</li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-xs text-text-muted">
                    No prior-art records were retrieved.
                  </div>
                )}

              </CardContent>
            </Card>
          )}

          {resultSubTab === 'explanation' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  ML Screening Explanation
                </CardTitle>

                <CardDescription>
                  Explanation generated from the actual similarity and ML screening results.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 space-y-2">
                  <h4 className="text-xs font-bold text-primary-light flex items-center gap-1.5">
                    <Bot className="w-4 h-4" />
                    Screening Rationale
                  </h4>

                  <p className="text-xs text-text-muted leading-relaxed">
                    {currentAnalysis.aiExplanation?.noveltyRationale ||
                      `The ML screening identified a highest document-level similarity of ${
                        currentAnalysis.overallSimilarityScore ?? 0
                      }%. This indicates potential technical overlap with retrieved patent records and should be reviewed further at the claim level.`}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="p-4 rounded-xl bg-success/10 border border-success/30 space-y-3">
                    <h4 className="text-xs font-bold text-success flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Screening Observations
                    </h4>

                    <ul className="space-y-2">
                      {(
                        currentAnalysis.aiExplanation?.distinctiveFeatures || [
                          'The current model performs document-level screening.',
                          'Claim-level novelty is not determined by this model.',
                          'Further claim-by-claim comparison is recommended.',
                        ]
                      ).map((f, i) => (
                        <li
                          key={i}
                          className="text-xs text-text-muted flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                    <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Retrieved Similarity Evidence
                    </h4>

                    <ul className="space-y-2">
                      {(
                        currentAnalysis.aiExplanation?.disclosedFeatures || [
                          `Highest overall similarity: ${
                            currentAnalysis.overallSimilarityScore ?? 0
                          }%`,
                          `Retrieved prior-art records: ${
                            currentAnalysis.relevantPriorArtCount ??
                            currentAnalysis.priorArtMatches?.length ??
                            0
                          }`,
                          'Similarity does not by itself establish lack of novelty.',
                        ]
                      ).map((f, i) => (
                        <li
                          key={i}
                          className="text-xs text-text-muted flex items-start gap-2"
                        >
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

          {resultSubTab === 'recommendations' && (
            <Card glow={true}>
              <CardHeader>
                <CardTitle>
                  Recommended Next Steps
                </CardTitle>

                <CardDescription>
                  Practical steps for reviewing the ML screening results.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">

                {(currentAnalysis.recommendations || [
                  'Review the highest-similarity patent record in detail.',
                  'Compare the independent claims of your invention with the retrieved documents.',
                  'Perform a broader prior-art search using additional technical keywords.',
                  'Use the similarity result as research evidence rather than a legal novelty conclusion.',
                  'Obtain professional patent examination or legal advice before filing decisions.',
                ]).map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0F172A] border border-card-border flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary-light font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <p className="text-xs text-text-main leading-relaxed pt-0.5">
                      {rec}
                    </p>
                  </div>
                ))}

              </CardContent>
            </Card>
          )}

        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>
              Saved Patent Screening History
            </CardTitle>

            <CardDescription>
              Archive of previously completed ML-assisted patent screening assessments.
            </CardDescription>
          </CardHeader>

          <CardContent>

            {analysisHistory.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-muted">
                No patent analyses performed yet. Use the Patent Input tab to run your first evaluation.
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
                        <span className="text-sm font-bold text-text-main">
                          {item.title}
                        </span>

                        <Badge
                          variant={
                            item.badgeVariant ||
                            getScreeningBadgeVariant()
                          }
                          size="sm"
                        >
                          {item.noveltyStatus || 'Screening'}
                        </Badge>
                      </div>

                      <p className="text-xs text-text-subtle">
                        Inventor: {item.inventor || 'Not specified'} • Date:{' '}
                        {item.analysisDate
                          ? new Date(item.analysisDate).toLocaleDateString()
                          : 'N/A'}{' '}
                        • Prior Art Matches:{' '}
                        {item.relevantPriorArtCount ??
                          item.priorArtMatches?.length ??
                          0}
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