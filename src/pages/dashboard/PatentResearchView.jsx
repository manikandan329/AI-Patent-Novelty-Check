import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Sparkles,
  Bookmark,
  History,
  BarChart3,
  Layers,
  FileText,
  Building,
  User,
  Calendar,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  ArrowRight,
  GitCompare,
  X,
  ExternalLink,
  BookOpen,
  Share2,
  RefreshCw,
  Info,
  Zap,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import {
  searchPatentKnowledgeBase,
  runAiPriorArtSearch,
  saveSearchHistory,
  getSearchHistory,
  savePatentToCollection,
  getSavedPatents,
  deleteSavedPatent,
  EXTENDED_PATENT_KNOWLEDGE_BASE,
} from '../../services/patentResearchService';
import { TECHNOLOGY_DOMAINS } from '../../services/patentDocumentProcessor';
import { useAuth } from '../../hooks/useAuth';

export const PatentResearchView = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const isDemoActive = userProfile?.isDemoMode || currentUser?.isDemo;

  // Search Input State
  const [searchQuery, setSearchQuery] = useState('');
  const [claimInput, setClaimInput] = useState('');
  const [showClaimInput, setShowClaimInput] = useState(false);
  const [searchType, setSearchType] = useState('semantic');

  // Filter & Sort State
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [minSimilarity, setMinSimilarity] = useState(0);
  const [yearRange, setYearRange] = useState([2018, 2026]);
  const [sortBy, setSortBy] = useState('similarity');
  const [page, setPage] = useState(1);

  // Stepped Progress Loader State
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState({ step: 1, message: '', progress: 0 });

  // UI Tabs
  const [activeTab, setActiveTab] = useState('results'); // 'results' | 'saved' | 'history'
  const [searchResults, setSearchResults] = useState(null);

  // Modals & Selection State
  const [selectedPatentDetails, setSelectedPatentDetails] = useState(null);
  const [saveModalPatent, setSaveModalPatent] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState('Prior Art Candidates');
  const [userNotes, setUserNotes] = useState('');

  const [savedPatentsList, setSavedPatentsList] = useState([]);
  const [historyList, setHistoryList] = useState([]);

  // Load Saved Items & Run Initial Search
  useEffect(() => {
    const userId = currentUser?.uid || 'demo_user';
    setSavedPatentsList(getSavedPatents(userId));
    getSearchHistory(userId).then(setHistoryList);

    // Default sample search execution
    handleExecuteSearch();
  }, []);

  // Execute Search Handler
  const handleExecuteSearch = async (overrideQuery = null) => {
    const queryToUse = overrideQuery !== null ? overrideQuery : searchQuery;
    setIsSearching(true);

    const queryParams = {
      query: queryToUse,
      claimInput,
      searchType,
      domain: selectedDomain,
      country: selectedCountry,
      yearRange,
      status: selectedStatus,
      minSimilarity,
      sortBy,
      page,
      pageSize: 8,
    };

    try {
      const output = await runAiPriorArtSearch(queryParams, (prog) => setSearchProgress(prog));
      setSearchResults(output);
      setIsSearching(false);
      setActiveTab('results');

      // Save search log
      const userId = currentUser?.uid || 'demo_user';
      await saveSearchHistory(userId, queryToUse || 'All Patents Search', searchType, queryParams, output.totalCount);
      const updatedHistory = await getSearchHistory(userId);
      setHistoryList(updatedHistory);
    } catch (err) {
      console.error('Search error:', err);
      setIsSearching(false);
      toast.error('Search execution failed.');
    }
  };

  // Clear Inputs Handler
  const handleClearInputs = () => {
    setSearchQuery('');
    setClaimInput('');
    setSelectedDomain('All');
    setSelectedCountry('All');
    setMinSimilarity(0);
    setSortBy('similarity');
    handleExecuteSearch('');
    toast.success('Search inputs cleared.');
  };

  // Send to Module 15 (Novelty Analysis)
  const handleAnalyzeAgainstPatent = (patent) => {
    toast('Transferring prior-art specification to Module 15 Novelty Analyzer...', { icon: '🚀' });
    navigate('/dashboard/novelty-analysis', {
      state: {
        prefilledPatent: {
          title: `Novelty Comparison against ${patent.patentId}: ${patent.title}`,
          abstract: patent.abstract,
          claims: patent.claims || `1. Novelty analysis reference derived from prior art ${patent.patentId}.`,
          inventor: patent.inventor || patent.applicant,
        },
      },
    });
  };

  // Save Patent to Collection Handler
  const handleSavePatent = async () => {
    if (!saveModalPatent) return;
    const userId = currentUser?.uid || 'demo_user';
    await savePatentToCollection(userId, saveModalPatent.patentId, selectedCollection, userNotes);
    setSavedPatentsList(getSavedPatents(userId));
    setSaveModalPatent(null);
    setUserNotes('');
    toast.success(`Saved ${saveModalPatent.patentId} to ${selectedCollection}!`);
  };

  // Remove Saved Patent
  const handleRemoveSavedPatent = async (patentId) => {
    const userId = currentUser?.uid || 'demo_user';
    await deleteSavedPatent(userId, patentId);
    setSavedPatentsList(getSavedPatents(userId));
    toast.success('Removed patent from saved collection.');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-text-main tracking-tight flex items-center gap-2">
              <Search className="w-6 h-6 text-primary-light" />
              Module 16: AI-Powered Prior-Art Search & Discovery
            </h1>
            {isDemoActive && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1">
            Discover relevant global prior-art patent filings using hybrid natural-language queries, claims vectors, and Gemini concept matching.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-[#0F172A] p-1.5 rounded-xl border border-card-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'results'
                ? 'bg-primary text-white shadow-md font-bold'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Search Results ({searchResults?.totalCount || 0})
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-primary text-white shadow-md font-bold'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Saved ({savedPatentsList.length})
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
            Search History ({historyList.length})
          </button>
        </div>
      </div>

      {/* SEARCH INPUT BAR SECTION */}
      <Card className="p-6 border-primary/30 shadow-glow-primary">
        <div className="space-y-4">
          
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Natural Language Query Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-text-subtle absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch()}
                placeholder="Describe invention in natural language (e.g. quantum micro-fluidic coolant channels or autonomous irrigation)..."
                className="w-full bg-[#0F172A] border border-card-border rounded-xl pl-11 pr-4 py-3 text-xs text-text-main focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-text-subtle"
              />
            </div>

            {/* Domain Selector */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-[#0F172A] border border-card-border rounded-xl px-3.5 py-3 text-xs text-text-main focus:outline-none shrink-0 w-full md:w-48"
            >
              <option value="All">All Domains</option>
              {TECHNOLOGY_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Search Trigger Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <Button
                variant="primary"
                size="md"
                icon={Sparkles}
                onClick={() => handleExecuteSearch()}
                className="flex-1 md:flex-initial py-3 font-bold shadow-md"
              >
                Search Prior Art
              </Button>

              <Button
                variant="ghost"
                size="md"
                onClick={handleClearInputs}
                className="text-text-muted hover:text-text-main border border-card-border"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Optional Patent Claim Input Toggle */}
          <div className="pt-1">
            <button
              onClick={() => setShowClaimInput(!showClaimInput)}
              className="text-xs text-primary-light hover:underline font-semibold flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              {showClaimInput ? 'Hide Patent Claim Text Input' : '+ Add Specific Patent Claim for Deep Vector Search'}
            </button>

            {showClaimInput && (
              <div className="mt-3 space-y-1.5 animate-fadeIn">
                <label className="text-[11px] font-semibold text-text-muted">Patent Claim Specification Text</label>
                <textarea
                  rows={3}
                  value={claimInput}
                  onChange={(e) => setClaimInput(e.target.value)}
                  placeholder="Paste specific independent or dependent claim clause to match against patent claims..."
                  className="w-full bg-[#0F172A] border border-card-border rounded-xl p-3 text-xs font-mono text-text-main focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-text-subtle resize-none"
                />
              </div>
            )}
          </div>

        </div>
      </Card>

      {/* MULTI-STEP SEARCH LOADER MODAL */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0F172A]/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-primary/40 text-center space-y-5 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-glow-primary mx-auto">
                <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-primary-light animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-text-main">AI Prior-Art Discovery</h3>
                <p className="text-xs text-text-muted">{searchProgress.message}</p>
              </div>

              <div className="w-full bg-[#0F172A] rounded-full h-2 border border-card-border overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-300"
                  style={{ width: `${searchProgress.progress}%` }}
                />
              </div>

              <div className="space-y-1.5 text-left text-xs bg-[#0F172A] p-3 rounded-xl border border-card-border/80">
                <div className={`flex items-center gap-2 ${searchProgress.step >= 1 ? 'text-success font-semibold' : 'text-text-subtle'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Understanding invention & query intent</span>
                </div>
                <div className={`flex items-center gap-2 ${searchProgress.step >= 2 ? 'text-success font-semibold' : 'text-text-subtle'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>2. Extracting technical concepts & synonyms</span>
                </div>
                <div className={`flex items-center gap-2 ${searchProgress.step >= 3 ? 'text-success font-semibold' : 'text-text-subtle'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. Hybrid vector search against USPTO & WIPO</span>
                </div>
                <div className={`flex items-center gap-2 ${searchProgress.step >= 4 ? 'text-success font-semibold' : 'text-text-subtle'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>4. Ranking relevance & synthesizing AI explanations</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB 1: SEARCH RESULTS & FILTERS */}
      {activeTab === 'results' && searchResults && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* FILTER SIDEBAR (1 Col) */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary-light" />
                  Search Filters
                </CardTitle>
                <button
                  onClick={() => handleExecuteSearch()}
                  className="text-xs text-primary-light hover:underline font-semibold"
                >
                  Apply
                </button>
              </CardHeader>
              <CardContent className="space-y-5 text-xs">
                
                {/* Sort By */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-muted">Sort Results By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      handleExecuteSearch();
                    }}
                    className="w-full bg-[#0F172A] border border-card-border rounded-xl p-2.5 text-text-main focus:outline-none"
                  >
                    <option value="similarity">Relevance / Similarity (Highest First)</option>
                    <option value="date">Newest Publication Date</option>
                    <option value="oldest">Oldest Publication Date</option>
                    <option value="title">Patent Title (A-Z)</option>
                  </select>
                </div>

                {/* Minimum Similarity Threshold Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-text-muted">Min Similarity Score</label>
                    <span className="font-mono text-primary-light font-bold">{minSimilarity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="5"
                    value={minSimilarity}
                    onChange={(e) => setMinSimilarity(Number(e.target.value))}
                    className="w-full accent-primary bg-[#0F172A] h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Country / Patent Office */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-muted">Patent Office / Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-[#0F172A] border border-card-border rounded-xl p-2.5 text-text-main focus:outline-none"
                  >
                    <option value="All">All Patent Offices</option>
                    <option value="United States">USPTO (United States)</option>
                    <option value="European Patent Office">EPO (Europe)</option>
                    <option value="WIPO">WIPO (International PCT)</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-text-muted">Patent Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full bg-[#0F172A] border border-card-border rounded-xl p-2.5 text-text-main focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Granted">Granted Patents</option>
                    <option value="Application Pending">Applications Pending</option>
                  </select>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExecuteSearch()}
                  className="w-full mt-2 justify-center border-card-border"
                >
                  Update Filtered Results
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* MAIN RESULTS GRID (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            
            <div className="flex items-center justify-between text-xs text-text-subtle border-b border-card-border/60 pb-3">
              <span>Showing <b>{searchResults.results.length}</b> of <b>{searchResults.totalCount}</b> prior-art results</span>
              <span>Sorted by <b className="text-primary-light capitalize">{sortBy}</b></span>
            </div>

            {searchResults.results.length === 0 ? (
              <Card className="p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-warning mx-auto" />
                <h3 className="text-base font-bold text-text-main">No Prior-Art Matches Found</h3>
                <p className="text-xs text-text-muted max-w-md mx-auto">
                  Try broadening your search query keywords, clearing domain filters, or lowering the minimum similarity threshold.
                </p>
                <Button variant="outline" size="sm" onClick={handleClearInputs} className="mx-auto mt-2">
                  Reset Search Filters
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {searchResults.results.map((patent) => (
                  <div
                    key={patent.patentId}
                    className="glass-card p-5 rounded-2xl border border-card-border hover:border-primary/40 transition-all space-y-4 shadow-lg"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-extrabold text-text-main hover:text-primary-light transition-colors cursor-pointer" onClick={() => setSelectedPatentDetails(patent)}>
                            {patent.title}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0F172A] border border-card-border text-primary-light font-bold">
                            {patent.patentId}
                          </span>
                          <Badge variant={patent.badgeVariant} size="sm">
                            {patent.relevanceCategory} ({patent.similarityScore}%)
                          </Badge>
                        </div>
                        <p className="text-xs text-text-subtle">
                          Applicant: <b className="text-text-muted">{patent.applicant}</b> • Inventor: {patent.inventor || 'N/A'} • Pub Date: {patent.publicationDate} • {patent.country}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-text-subtle block">Relevance</span>
                        <span className="text-xl font-bold text-warning">{patent.similarityScore}%</span>
                      </div>
                    </div>

                    {/* Abstract Snippet */}
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-2 bg-[#0F172A] p-3 rounded-xl border border-card-border/50">
                      {patent.abstract}
                    </p>

                    {/* AI MATCH EXPLANATION BOX */}
                    {patent.aiExplanation && (
                      <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-primary-light text-[11px]">
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>AI Match Explanation</span>
                        </div>
                        <p className="text-text-main text-[11px] font-medium leading-tight">
                          {patent.aiExplanation.summary}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-text-muted pt-1">
                          <span><b>Matching Concept:</b> {patent.aiExplanation.matchingConcepts[0]}</span>
                          {patent.aiExplanation.differentConcepts?.[0] && (
                            <span className="text-success"><b>Inventive Difference:</b> {patent.aiExplanation.differentConcepts[0]}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-card-border/60">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={GitCompare}
                          onClick={() => handleAnalyzeAgainstPatent(patent)}
                          className="bg-primary/20 hover:bg-primary/30 text-primary-light border-primary/40 font-bold"
                        >
                          Analyze Against This Patent
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Bookmark}
                          onClick={() => setSaveModalPatent(patent)}
                          className="text-text-muted hover:text-text-main"
                        >
                          Save / Bookmark
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedPatentDetails(patent)}
                        className="text-xs"
                      >
                        View Full Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 2: SAVED PATENTS COLLECTION */}
      {activeTab === 'saved' && (
        <Card>
          <CardHeader>
            <CardTitle>Bookmarked Research Collections</CardTitle>
            <CardDescription>
              Saved prior-art patent references with custom technical notes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {savedPatentsList.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-muted">
                No saved patents in collection yet. Click "Save / Bookmark" on search result cards to organize your prior art research!
              </div>
            ) : (
              <div className="space-y-4">
                {savedPatentsList.map((item) => {
                  const patent = EXTENDED_PATENT_KNOWLEDGE_BASE.find((p) => p.patentId === item.patentId) || {
                    patentId: item.patentId,
                    title: 'Saved Prior Art Patent Reference',
                    applicant: 'Prior Art Corp',
                    publicationDate: '2026-01-01',
                    abstract: 'Saved document in your research collection.',
                  };

                  return (
                    <div
                      key={item.saveId}
                      className="p-5 rounded-2xl glass-card border border-card-border space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-text-main">{patent.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-card border border-card-border text-primary-light">
                            {item.patentId}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary-light font-bold">
                            {item.collectionId}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemoveSavedPatent(item.patentId)}
                          className="text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-text-muted bg-[#0F172A] p-3 rounded-xl border border-card-border font-mono">
                          <b>Notes:</b> {item.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={GitCompare}
                          onClick={() => handleAnalyzeAgainstPatent(patent)}
                        >
                          Analyze Against This Patent
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: SEARCH HISTORY */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Prior-Art Search Logs</CardTitle>
            <CardDescription>
              Archive of past search queries and vector execution logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyList.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-muted">
                No search history logged yet. Run prior-art searches to populate history!
              </div>
            ) : (
              <div className="space-y-3">
                {historyList.map((log) => (
                  <div
                    key={log.searchId}
                    className="p-4 rounded-xl glass-card border border-card-border flex items-center justify-between gap-4 hover:border-primary/40 transition-all"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-text-main">"{log.query}"</span>
                      <p className="text-[11px] text-text-subtle">
                        Mode: <b className="capitalize text-text-muted">{log.searchType}</b> • Results Found: {log.resultCount} • Date: {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={ArrowRight}
                      onClick={() => {
                        setSearchQuery(log.query);
                        handleExecuteSearch(log.query);
                      }}
                    >
                      Re-run Search
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* COMPREHENSIVE PATENT DETAILS DRAWER MODAL */}
      <AnimatePresence>
        {selectedPatentDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <Card className="p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 border-primary/50">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">{selectedPatentDetails.patentId}</Badge>
                    <Badge variant="success" size="sm">{selectedPatentDetails.status || 'Granted'}</Badge>
                  </div>
                  <h2 className="text-lg font-extrabold text-text-main">{selectedPatentDetails.title}</h2>
                </div>
                <button onClick={() => setSelectedPatentDetails(null)} className="text-text-subtle hover:text-text-main">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-text-subtle uppercase mb-1">Abstract Overview</h4>
                  <p className="text-text-muted leading-relaxed bg-[#0F172A] p-3 rounded-xl border border-card-border">
                    {selectedPatentDetails.abstract}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-text-subtle uppercase mb-1">Claims Text</h4>
                  <p className="text-text-muted font-mono leading-relaxed bg-[#0F172A] p-3 rounded-xl border border-card-border">
                    {selectedPatentDetails.claims || '1. Prior art claim specification.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-text-subtle">Applicant / Assignee:</span>
                    <p className="text-text-main font-semibold">{selectedPatentDetails.applicant}</p>
                  </div>
                  <div>
                    <span className="font-bold text-text-subtle">Inventor:</span>
                    <p className="text-text-main font-semibold">{selectedPatentDetails.inventor || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-text-subtle">CPC Classification:</span>
                    <p className="text-primary-light font-mono font-semibold">{selectedPatentDetails.cpcClassification || 'G06N 10/00'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-text-subtle">Publication Date:</span>
                    <p className="text-text-muted font-mono">{selectedPatentDetails.publicationDate}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-card-border flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPatentDetails(null)}>
                    Close Details
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={GitCompare}
                    onClick={() => {
                      setSelectedPatentDetails(null);
                      handleAnalyzeAgainstPatent(selectedPatentDetails);
                    }}
                  >
                    Analyze Against This Patent
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAVE TO COLLECTION MODAL */}
      <AnimatePresence>
        {saveModalPatent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <Card className="p-6 max-w-md w-full space-y-4 border-primary/50">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <h3 className="text-base font-bold text-text-main">Save Patent to Research Collection</h3>
                <button onClick={() => setSaveModalPatent(null)} className="text-text-subtle hover:text-text-main">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-text-subtle">Target Collection Folder</label>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="w-full bg-[#0F172A] border border-card-border text-text-main text-xs rounded-xl p-2.5 mt-1 focus:outline-none"
                  >
                    <option value="Prior Art Candidates">Prior Art Candidates</option>
                    <option value="My Research">My Research</option>
                    <option value="Important Patents">Important Patents</option>
                    <option value="Further Review">Further Review</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-text-subtle">Personal Notes & Relevance</label>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    rows={3}
                    placeholder="Add personal technical research notes..."
                    className="w-full bg-[#0F172A] border border-card-border text-text-main text-xs rounded-xl p-2.5 mt-1 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setSaveModalPatent(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" icon={Bookmark} onClick={handleSavePatent}>
                  Save Patent
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PatentResearchView;
