import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Search, 
  Bookmark, 
  Sparkles, 
  Layers, 
  FileText, 
  History, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Filter, 
  ArrowUpDown, 
  Download, 
  BookOpen, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Calendar,
  X,
  Eye,
  GitCompare,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getWorkspaceData, deleteWorkspaceItem, savePatentToWorkspace } from '../../services/workspaceService';
import { exportReportToPDF } from '../../services/aiReportGeneratorService';

export default function PatentWorkspaceView() {
  const navigate = useNavigate();
  const { isDemoUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    savedPatents: [],
    bookmarkedPriorArt: [],
    noveltyAnalyses: [],
    claimComparisons: [],
    generatedReports: [],
    searches: []
  });

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modals state
  const [deleteModal, setDeleteModal] = useState({ open: false, type: '', item: null });
  const [detailModal, setDetailModal] = useState({ open: false, item: null, type: '' });
  const [newPatentModal, setNewPatentModal] = useState(false);
  const [newPatentForm, setNewPatentForm] = useState({ title: '', description: '', claims: '' });

  useEffect(() => {
    loadData();
  }, [isDemoUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getWorkspaceData(isDemoUser);
      setData(res);
    } catch (err) {
      console.error("Workspace load error:", err);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  const confirmDelete = (type, item, e) => {
    if (e) e.stopPropagation();
    setDeleteModal({ open: true, type, item });
  };

  const handleDeleteExecute = async () => {
    if (!deleteModal.item) return;
    const { type, item } = deleteModal;
    await deleteWorkspaceItem(type, item.id);
    
    // Update local UI state
    setData(prev => ({
      ...prev,
      [type]: prev[type].filter(x => x.id !== item.id)
    }));

    setDeleteModal({ open: false, type: '', item: null });
  };

  const handleSaveNewPatent = async (e) => {
    e.preventDefault();
    if (!newPatentForm.title.trim()) return;
    const updated = await savePatentToWorkspace(newPatentForm);
    setData(prev => ({ ...prev, savedPatents: updated }));
    setNewPatentForm({ title: '', description: '', claims: '' });
    setNewPatentModal(false);
  };

  // Filter and Search Logic
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const matchesQuery = (text) => !query || (text && text.toLowerCase().includes(query));

    const patents = data.savedPatents.filter(p => matchesQuery(p.title) || matchesQuery(p.description));
    const bookmarks = data.bookmarkedPriorArt.filter(b => matchesQuery(b.title) || matchesQuery(b.patentId) || matchesQuery(b.assignee));
    const novelty = data.noveltyAnalyses.filter(n => matchesQuery(n.title));
    const comparisons = data.claimComparisons.filter(c => matchesQuery(c.title));
    const reports = data.generatedReports.filter(r => matchesQuery(r.title) || matchesQuery(r.patentTitle));
    const searches = data.searches.filter(s => matchesQuery(s.query));

    // Sorting Helper
    const sortArr = (arr, dateKey = 'savedDate') => {
      return [...arr].sort((a, b) => {
        if (sortBy === 'newest') return new Date(b[dateKey] || 0) - new Date(a[dateKey] || 0);
        if (sortBy === 'oldest') return new Date(a[dateKey] || 0) - new Date(b[dateKey] || 0);
        if (sortBy === 'name') return (a.title || a.query || '').localeCompare(b.title || b.query || '');
        if (sortBy === 'highestScore') return (b.noveltyScore || b.similarity || 0) - (a.noveltyScore || a.similarity || 0);
        return 0;
      });
    };

    return {
      savedPatents: sortArr(patents, 'savedDate'),
      bookmarkedPriorArt: sortArr(bookmarks, 'bookmarkedDate'),
      noveltyAnalyses: sortArr(novelty, 'analysisDate'),
      claimComparisons: sortArr(comparisons, 'comparisonDate'),
      generatedReports: sortArr(reports, 'analysisDate'),
      searches: sortArr(searches, 'searchDate')
    };
  }, [data, searchQuery, sortBy]);

  const totalCount = 
    filteredData.savedPatents.length +
    filteredData.bookmarkedPriorArt.length +
    filteredData.noveltyAnalyses.length +
    filteredData.claimComparisons.length +
    filteredData.generatedReports.length +
    filteredData.searches.length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-7 h-7 text-blue-400" />
              Module 19: My Patent Workspace
            </h1>
            {isDemoUser && (
              <span className="bg-blue-900/60 text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-700/50">
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Centralized hub for managing saved inventions, prior-art bookmarks, novelty history, claim comparisons, reports, and search queries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setNewPatentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-900/30 transition"
          >
            <Plus className="w-4 h-4" />
            New Saved Patent
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Summary Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div 
            onClick={() => setActiveTab('patents')}
            className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              activeTab === 'patents' 
                ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-950/50' 
                : 'bg-slate-800/80 border-slate-700/70 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold uppercase">Saved Patents</span>
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">{data.savedPatents.length}</div>
          </div>

          <div 
            onClick={() => setActiveTab('bookmarks')}
            className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              activeTab === 'bookmarks' 
                ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-950/50' 
                : 'bg-slate-800/80 border-slate-700/70 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold uppercase">Prior Art</span>
              <Bookmark className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">{data.bookmarkedPriorArt.length}</div>
          </div>

          <div 
            onClick={() => setActiveTab('novelty')}
            className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              activeTab === 'novelty' 
                ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-950/50' 
                : 'bg-slate-800/80 border-slate-700/70 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold uppercase">Novelty</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">{data.noveltyAnalyses.length}</div>
          </div>

          <div 
            onClick={() => setActiveTab('comparisons')}
            className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              activeTab === 'comparisons' 
                ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-950/50' 
                : 'bg-slate-800/80 border-slate-700/70 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold uppercase">Comparisons</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">{data.claimComparisons.length}</div>
          </div>

          <div 
            onClick={() => setActiveTab('reports')}
            className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              activeTab === 'reports' 
                ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-950/50' 
                : 'bg-slate-800/80 border-slate-700/70 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold uppercase">Reports</span>
              <FileText className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">{data.generatedReports.length}</div>
          </div>

          <div 
            onClick={() => setActiveTab('searches')}
            className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              activeTab === 'searches' 
                ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-950/50' 
                : 'bg-slate-800/80 border-slate-700/70 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold uppercase">Searches</span>
              <Search className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">{data.searches.length}</div>
          </div>
        </div>

        {/* Filter Tabs, Global Search, and Sorting Bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Navigation Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'patents', label: 'Saved Patents' },
              { id: 'bookmarks', label: 'Prior Art' },
              { id: 'novelty', label: 'Novelty History' },
              { id: 'comparisons', label: 'Comparisons' },
              { id: 'reports', label: 'Reports' },
              { id: 'searches', label: 'Searches' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input & Sort Controls */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search workspace..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-slate-900 text-white">Newest First</option>
                <option value="oldest" className="bg-slate-900 text-white">Oldest First</option>
                <option value="name" className="bg-slate-900 text-white">Name / Title</option>
                <option value="highestScore" className="bg-slate-900 text-white">Highest Novelty/Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-slate-800 border border-slate-700 rounded-xl p-5 animate-pulse space-y-3">
                <div className="h-4 bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-700/60 rounded w-1/2" />
                <div className="h-10 bg-slate-700/40 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Content Display Area */}
        {!loading && (
          <div className="space-y-6">

            {/* 1. SAVED PATENTS SECTION */}
            {(activeTab === 'all' || activeTab === 'patents') && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" /> Saved Patents ({filteredData.savedPatents.length})
                </h3>

                {filteredData.savedPatents.length === 0 ? (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center text-slate-400 text-xs">
                    No saved patents found. You can add a new invention or save from Prior-Art Search.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredData.savedPatents.map(item => (
                      <div key={item.id} className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-4 shadow-lg transition flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-white text-sm leading-snug">{item.title}</h4>
                            {item.noveltyScore && (
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold shrink-0">
                                {item.noveltyScore}% Novelty
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.description}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-700/60">
                            <span>Saved: {item.savedDate}</span>
                            <span>•</span>
                            <span>Claims: {item.claimsCount}</span>
                            <span>•</span>
                            <span className="text-blue-400 font-semibold">{item.status}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-700/60">
                          <button
                            onClick={() => setDetailModal({ open: true, item, type: 'savedPatent' })}
                            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-medium"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" /> Details
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate('/dashboard/novelty-analysis', { state: { patentInfo: { title: item.title, claims: item.claims, abstract: item.description } } })}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition flex items-center gap-1"
                            >
                              Analyze Novelty <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              onClick={e => confirmDelete('savedPatents', item, e)}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. BOOKMARKED PRIOR ART SECTION */}
            {(activeTab === 'all' || activeTab === 'bookmarks') && (
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-indigo-400" /> Bookmarked Prior Art ({filteredData.bookmarkedPriorArt.length})
                </h3>

                {filteredData.bookmarkedPriorArt.length === 0 ? (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center text-slate-400 text-xs">
                    No bookmarked prior-art documents. Bookmark patents from Module 16 to review them here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredData.bookmarkedPriorArt.map(item => (
                      <div key={item.id} className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-4 shadow-lg transition flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-blue-400">{item.patentId}</span>
                            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-[10px] font-bold">
                              {item.similarity || '70%'} Similarity
                            </span>
                          </div>
                          <h4 className="font-semibold text-white text-xs leading-snug line-clamp-2 mb-2">{item.title}</h4>
                          <div className="text-[11px] text-slate-400 space-y-0.5">
                            <div>Assignee: <span className="text-slate-300">{item.assignee}</span></div>
                            <div>Pub Date: <span className="text-slate-300">{item.pubDate}</span></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-700/60">
                          <button
                            onClick={() => navigate('/dashboard/compare', { state: { priorArtDoc: item } })}
                            className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 rounded text-xs font-medium transition flex items-center gap-1"
                          >
                            <GitCompare className="w-3 h-3" /> Compare Claims
                          </button>
                          
                          <button
                            onClick={e => confirmDelete('bookmarkedPriorArt', item, e)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                            title="Remove Bookmark"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. NOVELTY ANALYSIS HISTORY SECTION */}
            {(activeTab === 'all' || activeTab === 'novelty') && (
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Novelty Analysis History ({filteredData.noveltyAnalyses.length})
                </h3>

                {filteredData.noveltyAnalyses.length === 0 ? (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center text-slate-400 text-xs">
                    No novelty analysis history found. Run Module 15 analysis to populate this archive.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredData.noveltyAnalyses.map(item => (
                      <div key={item.id} className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-4 shadow-lg transition flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-white text-sm leading-snug">{item.title}</h4>
                            <span className="px-2.5 py-1 rounded bg-slate-900 text-emerald-400 border border-slate-700 text-xs font-extrabold shrink-0">
                              {item.noveltyScore}%
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                            <span>Date: {item.analysisDate}</span>
                            <span>•</span>
                            <span className="text-slate-300">{item.noveltyStatus}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-700/60">
                          <button
                            onClick={() => navigate('/dashboard/report', { state: { noveltyData: item } })}
                            className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded text-xs font-medium transition flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" /> Generate Report
                          </button>
                          <button
                            onClick={e => confirmDelete('noveltyAnalyses', item, e)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. CLAIM COMPARISON HISTORY SECTION */}
            {(activeTab === 'all' || activeTab === 'comparisons') && (
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" /> Claim Comparison History ({filteredData.claimComparisons.length})
                </h3>

                {filteredData.claimComparisons.length === 0 ? (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center text-slate-400 text-xs">
                    No claim comparisons recorded. Execute Module 17 feature mapping to save comparisons.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredData.claimComparisons.map(item => (
                      <div key={item.id} className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-4 shadow-lg transition flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-white text-sm leading-snug">{item.title}</h4>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                            <span>Date: {item.comparisonDate}</span>
                            <span>•</span>
                            <span>Claims: {item.claimsAnalyzedCount}</span>
                            <span>•</span>
                            <span>Prior Art Docs: {item.priorArtCount}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-700/60">
                          <button
                            onClick={() => navigate('/dashboard/report', { state: { comparisonData: item } })}
                            className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded text-xs font-medium transition flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" /> Generate Report
                          </button>
                          <button
                            onClick={e => confirmDelete('claimComparisons', item, e)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. REPORT HISTORY SECTION */}
            {(activeTab === 'all' || activeTab === 'reports') && (
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rose-400" /> Generated Analysis Reports ({filteredData.generatedReports.length})
                </h3>

                {filteredData.generatedReports.length === 0 ? (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center text-slate-400 text-xs">
                    No reports generated yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredData.generatedReports.map(item => (
                      <div key={item.id} className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-4 shadow-lg transition flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-white text-sm leading-snug">{item.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 truncate">Invention: {item.patentTitle || item.title}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                            <span>Date: {item.analysisDate}</span>
                            <span>•</span>
                            <span className="text-blue-400 font-semibold">{item.status || 'Complete'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-700/60">
                          <button
                            onClick={() => exportReportToPDF(item)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition flex items-center gap-1 shadow"
                          >
                            <Download className="w-3 h-3" /> Download PDF
                          </button>
                          <button
                            onClick={e => confirmDelete('generatedReports', item, e)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. SEARCH HISTORY SECTION */}
            {(activeTab === 'all' || activeTab === 'searches') && (
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4 text-sky-400" /> Prior-Art Search History ({filteredData.searches.length})
                </h3>

                {filteredData.searches.length === 0 ? (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center text-slate-400 text-xs">
                    No recent search history.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {filteredData.searches.map(item => (
                      <div key={item.id} className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-3 shadow transition flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white truncate">"{item.query}"</p>
                          <span className="text-[10px] text-slate-500 block">{item.searchDate} • {item.resultsCount || 5} results</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate('/dashboard/research', { state: { query: item.query } })}
                            className="p-1 bg-slate-700 hover:bg-slate-600 text-sky-300 rounded text-xs transition"
                            title="Reopen Search"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => confirmDelete('searches', item, e)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Confirm Workspace Deletion</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{deleteModal.item?.title || deleteModal.item?.query}"</strong> from your workspace portfolio? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
              <button
                onClick={() => setDeleteModal({ open: false, type: '', item: null })}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExecute}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition shadow"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Quick View Modal */}
      {detailModal.open && detailModal.item && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Workspace Record Detail
              </h3>
              <button onClick={() => setDetailModal({ open: false, item: null, type: '' })} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Title / Name</span>
                <span className="text-sm font-bold text-white">{detailModal.item.title}</span>
              </div>

              {detailModal.item.description && (
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[10px]">Description</span>
                  <p className="bg-slate-900 p-3 rounded border border-slate-700/60 leading-relaxed text-slate-300">
                    {detailModal.item.description}
                  </p>
                </div>
              )}

              {detailModal.item.claims && (
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[10px]">Claims Text</span>
                  <p className="bg-slate-900 p-3 rounded border border-slate-700/60 leading-relaxed text-slate-300 font-mono text-[11px]">
                    {detailModal.item.claims}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
              <button
                onClick={() => {
                  const item = detailModal.item;
                  setDetailModal({ open: false, item: null, type: '' });
                  navigate('/dashboard/novelty-analysis', { state: { patentInfo: { title: item.title, claims: item.claims, abstract: item.description } } });
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Analyze Novelty (Module 15)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Saved Patent Modal */}
      {newPatentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                Add Saved Patent to Portfolio
              </h3>
              <button onClick={() => setNewPatentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPatent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Invention Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Powered Adaptive Energy Controller"
                  value={newPatentForm.title}
                  onChange={e => setNewPatentForm({ ...newPatentForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Abstract / Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of technical innovation..."
                  value={newPatentForm.description}
                  onChange={e => setNewPatentForm({ ...newPatentForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Patent Claims</label>
                <textarea
                  rows={4}
                  placeholder="Claim 1: A system comprising..."
                  value={newPatentForm.claims}
                  onChange={e => setNewPatentForm({ ...newPatentForm, claims: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setNewPatentModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow"
                >
                  Save Patent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
