import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Code,
  Tag,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Edit3,
  Sliders,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  processPatentDocument,
  getProcessedPatentSubmission,
  TECHNOLOGY_DOMAINS,
} from '../../services/patentDocumentProcessor';
import { loadPatentSubmissionDraft } from '../../services/patentSubmissionService';
import { useAuth } from '../../hooks/useAuth';

export const NlpDocumentProcessingView = () => {
  const { submissionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('features');
  const [loading, setLoading] = useState(true);
  const [statusStep, setStatusStep] = useState('Uploading');
  const [progressPercent, setProgressPercent] = useState(10);
  const [statusMessage, setStatusMessage] = useState('Initializing NLP Document Processing Engine...');
  const [processedData, setProcessedData] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [isEditingDomain, setIsEditingDomain] = useState(false);

  const effSubmissionId = submissionId || location.state?.submissionId || 'SUB-2026-98142';

  useEffect(() => {
    let isMounted = true;

    const runProcessingPipeline = async () => {
      setLoading(true);
      try {
        // Try fetching existing processed data first
        const existing = await getProcessedPatentSubmission(effSubmissionId);
        if (existing && existing.processing_status === 'Completed' && !location.state?.forceReprocess) {
          if (isMounted) {
            setProcessedData(existing);
            setSelectedDomain(existing.user_overridden_domain || existing.technology_domain);
            setStatusStep('Completed');
            setProgressPercent(100);
            setStatusMessage('Processed patent document loaded from repository.');
            setLoading(false);
          }
          return;
        }

        // Fetch draft input or fallback demo input
        let inputFields = {
          submissionId: effSubmissionId,
          userId: currentUser?.uid || 'demo_user',
          title: 'Autonomous Precision Irrigation System using Soil Moisture & Weather Intelligence',
          summary: 'An autonomous irrigation system using soil moisture sensors and weather predictions to automatically control water delivery.',
          problemStatement: 'Inconsistent crop watering leading to water waste and suboptimal harvest yields in high-variance soil zones.',
          proposedSolution: 'A closed-loop sensor-actuator mesh network utilizing local soil moisture probes combined with satellite weather forecasts to dynamically modulate micro-drip irrigation valves.',
          novelFeatures: 'Predictive weather-based water flow throttling combined with solar-powered ultra-wideband sensor nodes.',
          claims: `1. An autonomous precision irrigation system comprising: a soil moisture sensor array positioned in a crop cultivation zone; a weather prediction receiver configured to pull real-time barometric and satellite precipitation forecasts; a central processing decision engine coupled to said sensor array; and an automated fluid valve control mechanism.\n\n2. The autonomous system of claim 1, wherein said fluid valve control mechanism comprises a piezo-electric diaphragm actuator.\n\n3. The autonomous system of claim 1, further comprising a zero-latency ultra-wideband telemetry bus connecting said sensor array to the processing engine.`,
          keywords: ['irrigation', 'soil moisture', 'weather prediction', 'automated valve', 'autonomous decision'],
        };

        if (currentUser?.uid) {
          const draft = await loadPatentSubmissionDraft(currentUser.uid);
          if (draft) inputFields = { ...inputFields, ...draft, submissionId: effSubmissionId };
        }

        // Run Module 4 Processing Pipeline
        const result = await processPatentDocument(inputFields, null, ({ step, progress, message }) => {
          if (!isMounted) return;
          setStatusStep(step);
          setProgressPercent(progress);
          setStatusMessage(message);
        });

        if (isMounted) {
          setProcessedData(result);
          setSelectedDomain(result.technology_domain);
          setLoading(false);
          toast.success('Module 4: Patent Document & NLP Processing Completed!');
        }
      } catch (err) {
        if (isMounted) {
          setStatusStep('Failed');
          setStatusMessage('Processing Failed: ' + err.message);
          setLoading(false);
          toast.error('Document Processing Failed: ' + err.message);
        }
      }
    };

    runProcessingPipeline();

    return () => {
      isMounted = false;
    };
  }, [effSubmissionId, currentUser, location.state]);

  const handleDomainOverride = (newDomain) => {
    setSelectedDomain(newDomain);
    setIsEditingDomain(false);

    if (processedData) {
      const updated = { ...processedData, user_overridden_domain: newDomain };
      setProcessedData(updated);
      localStorage.setItem(`patentiq_doc_processed_${effSubmissionId}`, JSON.stringify(updated));
      toast.success(`Technology domain updated to "${newDomain}"`);
    }
  };

  const stepsList = [
    { key: 'Uploading', label: '1. File Upload' },
    { key: 'Extracting', label: '2. Section Parsing' },
    { key: 'Processing', label: '3. NLP Tokenization' },
    { key: 'Feature Extraction', label: '4. Feature & Domain Extraction' },
    { key: 'Completed', label: '5. Structured Ready' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-fadeIn">
      
      {/* Module 4 Scope Disclaimer Banner */}
      <div className="bg-primary/10 border border-primary/30 p-4 rounded-2xl flex items-start gap-3 text-xs text-text-muted">
        <Sparkles className="w-5 h-5 text-primary-light shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-text-main">
            Module 4: Patent Document Processing & NLP Engine Active
          </span>
          <p className="leading-relaxed">
            This module accepts patent documents, cleans technical content, extracts named entities, segments claims into sequential elements, and predicts technology classification. <strong className="text-primary-light">It does NOT perform novelty scoring or similarity searching.</strong>
          </p>
        </div>
      </div>

      {/* Header & Processing Progress Card */}
      <Card className="p-6 space-y-6 border-primary/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Module 4 Document Pipeline</Badge>
              <span className="text-xs text-text-subtle font-mono">{effSubmissionId}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-text-main mt-1">
              Patent Text Extraction & NLP Preprocessing
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                setLoading(true);
                processPatentDocument({ submissionId: effSubmissionId, title: processedData?.title }, null, ({ step, progress, message }) => {
                  setStatusStep(step);
                  setProgressPercent(progress);
                  setStatusMessage(message);
                }).then((res) => {
                  setProcessedData(res);
                  setLoading(false);
                  toast.success('Document re-processed successfully!');
                });
              }}
            >
              Re-Process Text
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => navigate(`/dashboard/processing/${effSubmissionId}`)}
            >
              Proceed to Vector Search
            </Button>
          </div>
        </div>

        {/* Stepper Status Indicators */}
        <div className="space-y-3 pt-2 border-t border-card-border/60">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-text-main flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary-light animate-spin" /> Status: {statusMessage}
            </span>
            <span className="font-mono text-primary-light font-bold">{progressPercent}%</span>
          </div>

          <div className="w-full bg-[#0F172A] h-2.5 rounded-full overflow-hidden border border-card-border p-0.5">
            <motion.div
              className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
              initial={{ width: '10%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            {stepsList.map((st, i) => {
              const isDone = progressPercent === 100 || stepsList.findIndex((s) => s.key === statusStep) > i;
              const isCurrent = statusStep === st.key;

              return (
                <div
                  key={st.key}
                  className={`p-2 rounded-xl text-[11px] font-semibold border flex items-center gap-2 transition-all ${
                    isDone
                      ? 'bg-success/10 border-success/30 text-success'
                      : isCurrent
                      ? 'bg-primary/10 border-primary/40 text-primary-light font-bold animate-pulse'
                      : 'bg-[#0F172A] border-card-border/50 text-text-subtle opacity-50'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <div className="w-2 h-2 rounded-full bg-current shrink-0" />}
                  <span className="truncate">{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Main Inspection Tabs Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-card-border pb-3">
        {[
          { id: 'features', label: 'Technical Features', icon: Sparkles },
          { id: 'claims', label: 'Claims Breakdown', icon: Layers },
          { id: 'domain', label: 'Technology Domain', icon: Sliders },
          { id: 'entities', label: 'Named Entities (NER)', icon: Tag },
          { id: 'keywords', label: 'Keywords & Phrases', icon: Code },
          { id: 'text', label: 'Original vs Cleaned', icon: FileText },
          { id: 'json', label: 'Structured JSON', icon: Code },
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

      {/* Tab Panels Content */}
      {processedData && (
        <div className="space-y-6">
          
          {/* TAB 1: TECHNICAL FEATURES */}
          {activeTab === 'features' && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-main">Extracted Technical Features</h3>
                  <p className="text-xs text-text-muted">
                    Discrete core components automatically identified from the invention text.
                  </p>
                </div>
                <Badge variant="primary" size="sm">
                  {processedData.technical_features?.length || 0} Features Extracted
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(processedData.technical_features || []).map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0F172A] border border-card-border/80 space-y-2 hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center font-mono text-xs font-bold">
                        {idx + 1}
                      </div>
                      <h4 className="text-xs font-bold text-text-main">{feat.title}</h4>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed pl-8">
                      {feat.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 2: CLAIMS BREAKDOWN */}
          {activeTab === 'claims' && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-main">Claim Segmentation & Element Breakdown</h3>
                  <p className="text-xs text-text-muted">
                    Claims parsed into independent/dependent types and sequential component elements.
                  </p>
                </div>
                <Badge variant="success" size="sm">
                  {processedData.claims?.length || 0} Claims Detected
                </Badge>
              </div>

              <div className="space-y-4">
                {(processedData.claims || []).map((claim) => (
                  <div key={claim.claimNumber} className="p-4 rounded-xl bg-[#0F172A] border border-card-border/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={claim.type === 'Independent Claim' ? 'primary' : 'outline'} size="sm">
                          Claim {claim.claimNumber} • {claim.type}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-text-subtle font-mono">
                        {claim.elementCount} Technical Elements
                      </span>
                    </div>

                    <p className="text-xs text-text-muted font-mono bg-card p-3 rounded-lg border border-card-border/40 leading-relaxed">
                      {claim.claimText}
                    </p>

                    {/* Element Flow Diagram */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">
                        Extracted Element Sequence:
                      </span>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {(claim.elements || []).map((elem, eIdx) => (
                          <React.Fragment key={eIdx}>
                            <span className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-primary-light text-xs font-semibold">
                              {elem}
                            </span>
                            {eIdx < claim.elements.length - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-text-subtle" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 3: TECHNOLOGY DOMAIN CLASSIFIER */}
          {activeTab === 'domain' && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-main">Automated Technology Domain Classification</h3>
                  <p className="text-xs text-text-muted">
                    AI classification based on technical terminology density. You may manually correct the domain if needed.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0F172A] border border-primary/30 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <span className="text-xs text-text-subtle uppercase font-semibold">Predicted Technology Domain</span>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-extrabold text-gradient-primary">
                      {selectedDomain || processedData.technology_domain}
                    </h2>
                    {processedData.user_overridden_domain && (
                      <Badge variant="warning" size="sm">User Modified</Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">
                    Confidence Rating: <strong className="text-success">{processedData.domain_confidence}%</strong> (High Probability Match)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {!isEditingDomain ? (
                    <Button variant="outline" size="sm" icon={Edit3} onClick={() => setIsEditingDomain(true)}>
                      Correct Domain
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedDomain}
                        onChange={(e) => handleDomainOverride(e.target.value)}
                        className="bg-card border border-primary/50 text-text-main text-xs rounded-xl px-3 py-2 focus:outline-none"
                      >
                        {TECHNOLOGY_DOMAINS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingDomain(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* TAB 4: NAMED ENTITIES (NER) */}
          {activeTab === 'entities' && (
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-main">Named Technical Entities (NER)</h3>
                  <p className="text-xs text-text-muted">
                    Extracted hardware components, algorithms, materials, protocols, and physical metrics.
                  </p>
                </div>
                <Badge variant="primary" size="sm">
                  {processedData.entities?.length || 0} Entities Found
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(processedData.entities || []).map((ent, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between">
                    <span className="text-xs font-bold text-text-main capitalize">{ent.name}</span>
                    <Badge variant="outline" size="sm">{ent.category}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 5: KEYWORDS & PHRASES */}
          {activeTab === 'keywords' && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-text-main">Keywords & Key N-Gram Phrases</h3>
                <p className="text-xs text-text-muted">
                  TF-IDF weighted technical keywords and multi-word domain compound phrases.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-text-subtle uppercase mb-2">Technical Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {(processedData.keywords || []).map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary-light text-xs font-medium">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-card-border/60">
                  <h4 className="text-xs font-bold text-text-subtle uppercase mb-2">Extracted N-Gram Compounds</h4>
                  <div className="flex flex-wrap gap-2">
                    {(processedData.important_phrases || []).map((phrase, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-card border border-card-border text-text-muted text-xs font-mono">
                        "{phrase}"
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 6: ORIGINAL VS CLEANED TEXT */}
          {activeTab === 'text' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-card-border pb-2">
                  <h4 className="text-xs font-bold text-text-main">Raw Document Text</h4>
                  <span className="text-[10px] text-text-subtle font-mono">
                    {processedData.nlp_stats?.rawLength || 0} characters
                  </span>
                </div>
                <div className="p-3 bg-[#0F172A] rounded-xl text-xs text-text-muted font-mono max-h-96 overflow-y-auto leading-relaxed">
                  {processedData.raw_text}
                </div>
              </Card>

              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-card-border pb-2">
                  <h4 className="text-xs font-bold text-primary-light">Cleaned & Normalized NLP Tokens</h4>
                  <span className="text-[10px] text-success font-mono">
                    {processedData.nlp_stats?.tokenCount || 0} tokens • Removed {processedData.nlp_stats?.removedStopwords || 0} stopwords
                  </span>
                </div>
                <div className="p-3 bg-[#0F172A] rounded-xl text-xs text-text-muted font-mono max-h-96 overflow-y-auto leading-relaxed">
                  {processedData.cleaned_text}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 7: STRUCTURED JSON REPRESENTATION */}
          {activeTab === 'json' && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-main">Structured Patent Representation</h3>
                  <p className="text-xs text-text-muted">
                    Clean JSON schema stored in <code className="text-primary-light font-mono">patent_submissions</code> repository.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(processedData, null, 2));
                    toast.success('JSON copied to clipboard!');
                  }}
                >
                  Copy JSON
                </Button>
              </div>

              <pre className="p-4 rounded-xl bg-[#0B1120] border border-card-border text-xs font-mono text-primary-light max-h-[500px] overflow-auto">
                {JSON.stringify(processedData, null, 2)}
              </pre>
            </Card>
          )}

        </div>
      )}

    </div>
  );
};

export default NlpDocumentProcessingView;
