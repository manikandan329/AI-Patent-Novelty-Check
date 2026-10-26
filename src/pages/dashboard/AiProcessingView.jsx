import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, CheckCircle2, RefreshCw, Terminal, Search, ShieldCheck, ArrowRight } from 'lucide-react';
import { executeSemanticSimilaritySearch } from '../../services/semanticSearchEngine';
import { loadPatentSubmissionDraft } from '../../services/patentSubmissionService';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export const AiProcessingView = () => {
  const { submissionId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [stepLabel, setStepLabel] = useState('Initializing AI Processing Engine...');
  const [progressPercent, setProgressPercent] = useState(10);
  const [logs, setLogs] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const runPipeline = async () => {
      const addLog = (msg) => {
        if (isMounted) {
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLogs((prev) => [...prev, `[${time}] ${msg}`]);
        }
      };

      addLog('Connecting to Firestore submission repository...');

      // Fetch patent submission details
      let subData = {
        submissionId: submissionId || 'SUB-2026-DEMO',
        userId: currentUser?.uid || 'user_123',
        title: 'Quantum Micro-Fluidic Neural Processing Unit',
        summary: 'A quantum micro-fluidic neural processor for high speed tensor operations.',
        problemStatement: 'Thermal dissipation in classical CMOS tensor processors.',
        proposedSolution: 'Semiconductor channels with liquid dielectric coolant.',
        novelFeatures: 'Micro-fluidic dielectric channels integrated on-chip.',
        workingPrinciple: 'Continuous laminar coolant flow while executing matrix operations.',
        advantages: '40% energy reduction, 99.4% signal fidelity.',
        applications: 'Edge AI hardware, bio-medical signal processors.',
      };

      if (currentUser?.uid) {
        const draft = await loadPatentSubmissionDraft(currentUser.uid);
        if (draft) subData = { ...subData, ...draft, submissionId: submissionId || draft.submissionId || 'SUB-2026-DEMO' };
      }

      addLog(`Loaded patent document "${subData.title.slice(0, 40)}..."`);

      try {
        await executeSemanticSimilaritySearch(subData, ({ step, label, progress }) => {
          if (!isMounted) return;
          setCurrentStep(step);
          setStepLabel(label);
          setProgressPercent(progress);
          addLog(label);
        });

        if (isMounted) {
          setIsCompleted(true);
          addLog('Vector similarity search finished. Results stored in Firestore.');
          setTimeout(() => {
            navigate(`/dashboard/results/${submissionId || 'SUB-2026-DEMO'}`);
          }, 1200);
        }
      } catch (err) {
        addLog('ERROR: Similarity search failed - ' + err.message);
      }
    };

    runPipeline();

    return () => {
      isMounted = false;
    };
  }, [submissionId, currentUser, navigate]);

  const pipelineSteps = [
    { num: 1, label: 'Preparing patent submission data' },
    { num: 2, label: 'Cleaning text & NLP tokenization' },
    { num: 3, label: 'Generating 384-dim vector embeddings' },
    { num: 4, label: 'Searching FAISS vector database' },
    { num: 5, label: 'Retrieving & ranking Top 10 similar patents' },
    { num: 6, label: 'Saving results to Firestore' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge variant="primary" size="md" className="mx-auto">
          AI Pipeline Phase 1 Active
        </Badge>
        <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
          Patent Vector Embedding & <span className="text-gradient-primary">Prior Art Search</span>
        </h1>
        <p className="text-xs text-text-muted">
          Processing ID: <span className="font-mono text-primary-light font-bold">{submissionId || 'SUB-2026-DEMO'}</span>
        </p>
      </div>

      {/* Main Processing Canvas */}
      <Card glow={true} className="p-8 border-primary/40 space-y-8 text-center relative overflow-hidden">
        
        {/* Animated Radar Visualizer */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-secondary/30 animate-pulse" />
          <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center text-primary-light shadow-glow-primary">
            <Cpu className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Live Step Label & Progress Bar */}
        <div className="space-y-3 max-w-lg mx-auto">
          <h3 className="text-lg font-bold text-text-main">{stepLabel}</h3>

          <div className="w-full bg-[#0F172A] border border-card-border h-3 rounded-full overflow-hidden p-0.5">
            <motion.div
              className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
              initial={{ width: '10%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <span className="text-xs font-mono text-text-subtle font-bold">
            {progressPercent}% Complete
          </span>
        </div>

        {/* Step Checkmarks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-left max-w-2xl mx-auto pt-4 border-t border-card-border/60">
          {pipelineSteps.map((step) => {
            const isDone = currentStep > step.num || isCompleted;
            const isCurrent = currentStep === step.num && !isCompleted;

            return (
              <div
                key={step.num}
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                  isDone
                    ? 'bg-success/10 border-success/30 text-success'
                    : isCurrent
                    ? 'bg-primary/10 border-primary/40 text-primary-light font-bold'
                    : 'bg-[#0F172A] border-card-border/60 text-text-subtle opacity-60'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
                ) : isCurrent ? (
                  <RefreshCw className="w-4 h-4 shrink-0 text-primary-light animate-spin" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-card-border flex items-center justify-center text-[10px]">
                    {step.num}
                  </span>
                )}
                <span className="truncate">{step.label}</span>
              </div>
            );
          })}
        </div>

      </Card>

      {/* Terminal Log Console */}
      <Card className="p-5 border-card-border bg-[#0B1120] font-mono text-xs space-y-2">
        <div className="flex items-center justify-between border-b border-card-border/60 pb-2">
          <span className="text-text-subtle flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-primary-light" /> Vector Processing Execution Log
          </span>
          <span className="text-[10px] text-success">Live Engine Sync</span>
        </div>

        <div className="max-h-40 overflow-y-auto space-y-1 text-text-muted font-mono text-[11px]">
          {logs.map((log, i) => (
            <div key={i} className="leading-relaxed">
              <span className="text-primary-light">&gt;</span> {log}
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};

export default AiProcessingView;
