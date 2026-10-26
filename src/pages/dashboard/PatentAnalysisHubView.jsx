import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, PlusCircle, FolderKanban, FileSearch } from 'lucide-react';
import { PatentNoveltyAnalysisView } from './PatentNoveltyAnalysisView';
import { NewAnalysisView } from './NewAnalysisView';
import PatentWorkspaceView from './PatentWorkspaceView';
import { NlpDocumentProcessingView } from './NlpDocumentProcessingView';

export const PatentAnalysisHubView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { analysisId, submissionId } = useParams();

  // Determine initial active tab based on path or query param
  const getInitialTab = () => {
    const qTab = searchParams.get('tab');
    if (qTab && ['novelty', 'submit', 'workspace', 'nlp'].includes(qTab)) {
      return qTab;
    }
    const path = location.pathname;
    if (path.includes('new-analysis') || qTab === 'submit') return 'submit';
    if (path.includes('workspace') || qTab === 'workspace') return 'workspace';
    if (path.includes('nlp-processing') || qTab === 'nlp' || submissionId) return 'nlp';
    return 'novelty';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Sync state if pathname or search params change
  useEffect(() => {
    const qTab = searchParams.get('tab');
    if (qTab && ['novelty', 'submit', 'workspace', 'nlp'].includes(qTab)) {
      setActiveTab(qTab);
    } else if (location.pathname.includes('new-analysis')) {
      setActiveTab('submit');
    } else if (location.pathname.includes('workspace')) {
      setActiveTab('workspace');
    } else if (location.pathname.includes('nlp-processing')) {
      setActiveTab('nlp');
    } else if (location.pathname.includes('novelty-analysis') || location.pathname === '/dashboard/analysis') {
      setActiveTab('novelty');
    }
  }, [location.pathname, searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const tabs = [
    {
      id: 'novelty',
      label: 'AI Novelty Screening',
      icon: Sparkles,
      description: 'Instant ML Logistic Regression & TF-IDF Prior Art Screening',
    },
    {
      id: 'submit',
      label: 'Submission Wizard',
      icon: PlusCircle,
      description: '5-Step Structured Patent Application Draft with Autosave',
    },
    {
      id: 'workspace',
      label: 'Patent Workspace',
      icon: FolderKanban,
      description: 'Saved Inventions, Bookmarks, and Active Claim Notes',
    },
    {
      id: 'nlp',
      label: 'NLP & Doc Inspector',
      icon: FileSearch,
      description: 'Syntactic Parsing, Readability & Keyword Domain Extraction',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header & Integrated Sub-Navigation Tabs */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl border border-card-border/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-light">
                <Sparkles className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-text-main">
                Patent Analysis Engine
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Unified workspace for patent drafting, preliminary novelty screening, claims inspection, and research management.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-card-border text-[11px] font-medium text-text-subtle self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>AI Screening Model Active</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-card-border/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left group ${
                  isCurrent
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 border border-primary font-bold'
                    : 'bg-[#0F172A]/70 text-text-muted hover:text-text-main hover:bg-[#0F172A] border border-card-border/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isCurrent ? 'text-white' : 'text-primary-light'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{tab.label}</div>
                  <div
                    className={`text-[10px] truncate font-normal ${
                      isCurrent ? 'text-blue-100' : 'text-text-subtle'
                    }`}
                  >
                    {tab.id === 'novelty'
                      ? 'ML Screening'
                      : tab.id === 'submit'
                      ? '5-Step Wizard'
                      : tab.id === 'workspace'
                      ? 'Saved Items'
                      : 'Text Parser'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active View with All Props and State Preserved */}
      <div>
        {activeTab === 'novelty' && <PatentNoveltyAnalysisView />}
        {activeTab === 'submit' && <NewAnalysisView />}
        {activeTab === 'workspace' && <PatentWorkspaceView />}
        {activeTab === 'nlp' && <NlpDocumentProcessingView />}
      </div>
    </div>
  );
};

export default PatentAnalysisHubView;
