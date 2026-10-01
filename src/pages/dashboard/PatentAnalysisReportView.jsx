import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  History, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  RefreshCw, 
  ArrowLeft, 
  ExternalLink, 
  ShieldAlert, 
  Layers, 
  Search, 
  Building2, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Trash2,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { 
  generatePatentAnalysisReport, 
  getSampleDemoReport, 
  saveReport, 
  getSavedReports, 
  deleteReport, 
  exportReportToPDF,
  REPORT_DISCLAIMER 
} from '../../services/aiReportGeneratorService';

const LOADING_STEPS = [
  "Collecting analysis results",
  "Organizing prior art",
  "Preparing claim comparison",
  "Generating AI summary",
  "Formatting report",
  "Report ready"
];

export default function PatentAnalysisReportView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDemoUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [report, setReport] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    execSummary: true,
    priorArt: true,
    claimMapping: true,
    novelty: true,
    findings: true,
    recommendations: true
  });
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    initReportGeneration();
  }, [location.state]);

  const initReportGeneration = async () => {
    setLoading(true);
    setCurrentStep(0);
    setErrorMsg(null);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 450);

    try {
      const incomingState = location.state || {};
      const generated = await generatePatentAnalysisReport({
        noveltyData: incomingState.noveltyData,
        researchData: incomingState.researchData,
        comparisonData: incomingState.comparisonData,
        userInvention: incomingState.userInvention || incomingState.patentInfo
      });

      setReport(generated);
      await saveReport(generated);
    } catch (err) {
      console.error("Report generation error:", err);
      setErrorMsg("Failed to generate complete AI report. Loaded fallback view.");
      setReport(getSampleDemoReport());
    } finally {
      clearInterval(stepInterval);
      setCurrentStep(LOADING_STEPS.length - 1);
      setTimeout(() => setLoading(false), 300);
    }
  };

  const loadHistory = async () => {
    const list = await getSavedReports();
    setHistoryList(list);
    setHistoryModalOpen(true);
  };

  const handleDeleteReport = async (e, id) => {
    e.stopPropagation();
    const updated = await deleteReport(id);
    setHistoryList(updated);
    if (report?.id === id && updated.length > 0) {
      setReport(updated[0]);
    }
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadPdf = () => {
    if (!report) return;
    exportReportToPDF(report);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-7 h-7 text-blue-400" />
              Module 18: AI Patent Analysis Report Generator
            </h1>
            {isDemoUser && (
              <span className="bg-blue-900/60 text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-700/50">
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Consolidates Novelty Analysis (Module 15), Prior-Art Search (Module 16), and Claim Comparison (Module 17) into a structured research report.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadHistory}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition border border-slate-700"
          >
            <History className="w-4 h-4 text-blue-400" />
            Report History
          </button>
          
          <button
            onClick={initReportGeneration}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition border border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            Regenerate Report
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={loading || !report}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-900/30 transition"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-amber-900/30 border border-amber-700/50 text-amber-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            {errorMsg}
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline text-amber-300">Dismiss</button>
        </div>
      )}

      {/* Loading Progress State */}
      {loading && (
        <div className="max-w-3xl mx-auto my-12 bg-slate-800/80 border border-slate-700 rounded-xl p-8 text-center shadow-xl">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Sparkles className="w-12 h-12 text-blue-400 animate-pulse" />
              <div className="absolute -inset-1 rounded-full bg-blue-500/20 animate-ping" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Generating Comprehensive Patent Analysis Report...</h3>
          <p className="text-sm text-slate-400 mb-6">{LOADING_STEPS[currentStep]}</p>
          
          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-400 text-left mt-6 pt-4 border-t border-slate-700/60">
            {LOADING_STEPS.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {idx < currentStep ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : idx === currentStep ? (
                  <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-700 shrink-0" />
                )}
                <span className={idx === currentStep ? "text-blue-300 font-medium" : idx < currentStep ? "text-slate-300" : "text-slate-500"}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Report View */}
      {!loading && report && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Executive Overview Header Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-700/70">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-blue-400 tracking-wider mb-1">
                  <BookOpen className="w-4 h-4" />
                  {report.sections.reportTitle}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{report.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-500" /> {report.applicant}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-500" /> {report.analysisDate}</span>
                  <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-slate-500" /> {report.totalClaimsAnalyzed} Claims Analyzed</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Novelty Status</div>
                  <div className="text-lg font-bold text-emerald-400">{report.noveltyStatus}</div>
                </div>
                <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold text-blue-400">{report.noveltyScore}%</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Score</span>
                </div>
              </div>
            </div>

            {/* Metric Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-700/60 rounded-lg p-3 text-center">
                <span className="text-xs text-slate-400 block mb-1">Total Features</span>
                <span className="text-xl font-bold text-white">{report.totalFeatures}</span>
              </div>
              <div className="bg-slate-900/80 border border-emerald-900/40 rounded-lg p-3 text-center">
                <span className="text-xs text-emerald-400 block mb-1">Matched Features</span>
                <span className="text-xl font-bold text-emerald-400">{report.matchedCount}</span>
              </div>
              <div className="bg-slate-900/80 border border-amber-900/40 rounded-lg p-3 text-center">
                <span className="text-xs text-amber-400 block mb-1">Partially Matched</span>
                <span className="text-xl font-bold text-amber-400">{report.partiallyMatchedCount}</span>
              </div>
              <div className="bg-slate-900/80 border border-rose-900/40 rounded-lg p-3 text-center">
                <span className="text-xs text-rose-400 block mb-1">Unmatched (Novel)</span>
                <span className="text-xl font-bold text-rose-400">{report.notFoundCount}</span>
              </div>
            </div>
          </div>

          {/* Quick Module Navigation Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" /> Source Modules
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard/novelty-analysis', { state: { patentInfo: { title: report.title } } })}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-xs text-blue-300 rounded border border-slate-700 transition flex items-center gap-1"
              >
                Module 15: Novelty Analysis <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={() => navigate('/dashboard/research', { state: { query: report.title } })}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-xs text-blue-300 rounded border border-slate-700 transition flex items-center gap-1"
              >
                Module 16: Prior Art Search <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={() => navigate('/dashboard/compare', { state: { claimsText: report.sections.claimsAnalyzed?.[0]?.text } })}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-xs text-blue-300 rounded border border-slate-700 transition flex items-center gap-1"
              >
                Module 17: Claim Comparison <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* SECTION 1 & 2: EXECUTIVE SUMMARY & INVENTION OVERVIEW */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <button
              onClick={() => toggleSection('execSummary')}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition text-left"
            >
              <span className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                1. Executive Summary & Invention Overview
              </span>
              {expandedSections.execSummary ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.execSummary && (
              <div className="p-6 border-t border-slate-700/80 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Executive Summary</h4>
                  <div className="p-4 bg-blue-950/40 border border-blue-800/50 rounded-lg text-sm text-slate-200 leading-relaxed">
                    {report.sections.executiveSummary}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Invention Overview</h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    {report.sections.inventionOverview}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 6 & 7: PRIOR-ART SEARCH SUMMARY & DOCUMENTS TABLE */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <button
              onClick={() => toggleSection('priorArt')}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition text-left"
            >
              <span className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-400" />
                2. Relevant Prior-Art Documents (Module 16 Data)
              </span>
              {expandedSections.priorArt ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.priorArt && (
              <div className="p-6 border-t border-slate-700/80 space-y-4">
                <p className="text-sm text-slate-300">{report.sections.priorArtSearchSummary}</p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-700">
                        <th className="p-3">Patent ID</th>
                        <th className="p-3">Title</th>
                        <th className="p-3">Assignee / Applicant</th>
                        <th className="p-3">Relevance</th>
                        <th className="p-3">Similarity</th>
                        <th className="p-3">Relevant Disclosed Features</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {report.sections.relevantPriorArtDocs.map((doc, idx) => (
                        <tr key={idx} className="hover:bg-slate-750">
                          <td className="p-3 font-semibold text-blue-400">{doc.patentId}</td>
                          <td className="p-3 text-slate-200 max-w-xs truncate">{doc.title}</td>
                          <td className="p-3 text-slate-300">{doc.assignee}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-medium">
                              {doc.relevance}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-200">{doc.similarity}</td>
                          <td className="p-3 text-slate-400 max-w-sm">{doc.relevantFeatures}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 8 & 9: CLAIM-TO-PRIOR-ART MAPPING & TECHNICAL FEATURE COMPARISON */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <button
              onClick={() => toggleSection('claimMapping')}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition text-left"
            >
              <span className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                3. Technical Feature Mapping Matrix (Module 17 Data)
              </span>
              {expandedSections.claimMapping ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.claimMapping && (
              <div className="p-6 border-t border-slate-700/80 space-y-4">
                <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded border border-slate-700">
                  {report.sections.technicalFeatureComparison.breakdownText}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-700">
                        <th className="p-3">Claim</th>
                        <th className="p-3">Technical Feature</th>
                        <th className="p-3">Prior-Art Patent</th>
                        <th className="p-3">Match Status</th>
                        <th className="p-3">Similarity</th>
                        <th className="p-3">AI Rationale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {report.sections.claimToPriorArtMapping.map((map, idx) => {
                        let statusColor = "bg-emerald-950 text-emerald-300 border-emerald-800/60";
                        if (map.status === "PARTIALLY MATCHED") statusColor = "bg-amber-950 text-amber-300 border-amber-800/60";
                        if (map.status === "NOT FOUND") statusColor = "bg-rose-950 text-rose-300 border-rose-800/60";

                        return (
                          <tr key={idx} className="hover:bg-slate-750">
                            <td className="p-3 font-medium text-slate-300">Claim {map.claimNum}</td>
                            <td className="p-3 font-semibold text-white">{map.feature}</td>
                            <td className="p-3 text-blue-400 font-medium">{map.priorArt}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${statusColor}`}>
                                {map.status}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-200">{map.similarity}</td>
                            <td className="p-3 text-slate-300 max-w-md">{map.explanation}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 10 & 11: NOVELTY ASSESSMENT */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <button
              onClick={() => toggleSection('novelty')}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition text-left"
            >
              <span className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                4. AI Novelty & Similarity Assessment
              </span>
              {expandedSections.novelty ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.novelty && (
              <div className="p-6 border-t border-slate-700/80 space-y-4">
                <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold block">Official AI Classification</span>
                    <span className="text-sm font-semibold text-blue-300">{report.sections.noveltyAssessment.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase font-semibold block">Confidence Level</span>
                    <span className="text-sm font-bold text-emerald-400">{report.confidenceLevel}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-lg border border-slate-700/40">
                  {report.sections.noveltyAssessment.details}
                </p>
              </div>
            )}
          </div>

          {/* SECTION 12, 13, 14: KEY FINDINGS, DISTINCTIVE & OVERLAPPING FEATURES */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <button
              onClick={() => toggleSection('findings')}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition text-left"
            >
              <span className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                5. Key Findings & Feature Differentiation
              </span>
              {expandedSections.findings ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.findings && (
              <div className="p-6 border-t border-slate-700/80 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Key Research Findings</h4>
                  <ul className="space-y-2">
                    {report.sections.keyFindings.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-lg">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">Potentially Distinctive Features (Novelty Candidates)</h4>
                    <ul className="space-y-2">
                      {report.sections.potentiallyDistinctiveFeatures.map((item, idx) => (
                        <li key={idx} className="text-xs text-emerald-200 flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-rose-950/30 border border-rose-800/40 rounded-lg">
                    <h4 className="text-xs font-bold text-rose-400 uppercase mb-2">Potentially Overlapping Features (Prior-Art Overlap)</h4>
                    <ul className="space-y-2">
                      {report.sections.potentiallyOverlappingFeatures.map((item, idx) => (
                        <li key={idx} className="text-xs text-rose-200 flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 15 & 16: AI RECOMMENDATIONS & LEGAL DISCLAIMER */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <button
              onClick={() => toggleSection('recommendations')}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition text-left"
            >
              <span className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                6. AI Recommendations & Legal Disclaimer
              </span>
              {expandedSections.recommendations ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.recommendations && (
              <div className="p-6 border-t border-slate-700/80 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Strategic Research Recommendations</h4>
                  <ul className="space-y-2">
                    {report.sections.aiRecommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-950/40 border border-amber-700/50 rounded-lg flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200 leading-relaxed">
                    <span className="font-bold block text-amber-300 mb-1">IMPORTANT NON-LEGAL DISCLAIMER</span>
                    {report.sections.disclaimer}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                Saved Patent Analysis Reports
              </h3>
              <button onClick={() => setHistoryModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {historyList.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No saved reports found.</p>
              ) : (
                historyList.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => { setReport(item); setHistoryModalOpen(false); }}
                    className="p-4 bg-slate-900 border border-slate-700 hover:border-blue-500/50 rounded-lg cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Date: {item.analysisDate} | Claims: {item.totalClaimsAnalyzed} | Novelty Score: {item.noveltyScore}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); exportReportToPDF(item); }}
                        className="px-2.5 py-1 bg-blue-900/60 text-blue-300 hover:bg-blue-800 border border-blue-700 rounded text-xs transition"
                      >
                        PDF
                      </button>
                      <button
                        onClick={(e) => handleDeleteReport(e, item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-700 pt-3 flex justify-end">
              <button onClick={() => setHistoryModalOpen(false)} className="px-4 py-2 bg-slate-700 text-sm font-medium text-slate-200 rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
