import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, Heart, Download, Share2, Eye, Calendar, Sparkles, BarChart3, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUserReportsList, toggleFavoriteReport, generateShareableReportLink } from '../../services/reportManagementService';
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ShareReportModal from '../../components/dashboard/ShareReportModal';
import { generatePdfAuditReport } from '../../utils/pdfReportGenerator';
import toast from 'react-hot-toast';

export const ReportsView = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'favorites'
  const [shareReport, setShareReport] = useState(null);

  useEffect(() => {
    getUserReportsList(currentUser?.uid).then(setReports);
  }, [currentUser]);

  const handleToggleFavorite = async (reportId, currentFav) => {
    const updated = await toggleFavoriteReport(currentUser?.uid, reportId, currentFav);
    setReports(updated);
    toast.success(currentFav ? 'Removed from favorites' : 'Added to favorite reports!', { icon: '❤️' });
  };

  // Filter & Search Logic
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (activeTab === 'favorites' && !r.favorite) return false;
      if (r.noveltyScore < minScore) return false;
      if (selectedDomain !== 'All' && r.category !== selectedDomain) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesSubId = r.submissionId.toLowerCase().includes(q);
        const matchesCategory = r.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubId && !matchesCategory) return false;
      }
      return true;
    });
  }, [reports, activeTab, minScore, selectedDomain, searchTerm]);

  // Statistics
  const totalCount = reports.length;
  const favCount = reports.filter((r) => r.favorite).length;
  const highNoveltyCount = reports.filter((r) => r.noveltyScore >= 90).length;
  const avgScore = totalCount > 0 ? (reports.reduce((acc, r) => acc + r.noveltyScore, 0) / totalCount).toFixed(1) : '91.8';

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-text-main">Reports Hub & Audit Repository</h1>
          <p className="text-xs text-text-muted">
            Manage, export, filter, and share generated patent novelty evaluation reports.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Sparkles}
          onClick={() => navigate('/dashboard/new-analysis')}
          className="shadow-glow-primary"
        >
          New Patent Scan
        </Button>
      </div>

      {/* Quick Statistics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-text-subtle">Total Reports</p>
            <p className="text-xl font-extrabold text-text-main">{totalCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-xs text-text-subtle">Bookmarked / Favorites</p>
            <p className="text-xl font-extrabold text-text-main">{favCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/20 text-success flex items-center justify-center font-bold">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-xs text-text-subtle">Highly Novel (90%+)</p>
            <p className="text-xl font-extrabold text-success">{highNoveltyCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary-light flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-text-subtle">Average Score</p>
            <p className="text-xl font-extrabold text-secondary-light">{avgScore}%</p>
          </div>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-5 space-y-4">
        
        {/* Top Tab Switcher & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-[#0F172A] rounded-xl border border-card-border">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'
              }`}
            >
              All Reports ({reports.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'favorites' ? 'bg-rose-500 text-white shadow-md' : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" /> Favorites ({favCount})
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by title, ID, or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0F172A] border border-card-border/80 rounded-xl py-2 pl-10 pr-3 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-card-border/60 text-xs">
          
          <div>
            <label className="block text-[10px] font-bold text-text-subtle uppercase mb-1">Domain Filter</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full bg-[#0F172A] border border-card-border rounded-xl p-2 text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All">All Domains</option>
              <option value="Quantum Electronics">Quantum Electronics</option>
              <option value="Biotechnology">Biotechnology</option>
              <option value="Autonomous Robotics">Autonomous Robotics</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Materials Science">Materials Science</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-text-subtle uppercase mb-1">Date Range</label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full bg-[#0F172A] border border-card-border rounded-xl p-2 text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-bold text-text-subtle uppercase mb-1">
              <span>Min Novelty Score</span>
              <span className="text-primary-light">{minScore}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer mt-1"
            />
          </div>

        </div>

      </Card>

      {/* Reports Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <motion.div key={report.reportId || report.submissionId} layout>
              <Card className="h-full flex flex-col justify-between p-5 space-y-4 hover:border-primary/40 transition-all relative group">
                
                {/* Favorite Heart Trigger Top Right */}
                <button
                  onClick={() => handleToggleFavorite(report.reportId, report.favorite)}
                  className={`absolute top-4 right-4 p-1.5 rounded-lg border transition-all ${
                    report.favorite
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : 'bg-card border-card-border text-text-subtle hover:text-rose-400'
                  }`}
                  title={report.favorite ? 'Remove favorite' : 'Bookmark favorite'}
                >
                  <Heart className={`w-4 h-4 ${report.favorite ? 'fill-current' : ''}`} />
                </button>

                <div className="space-y-2 pr-8">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">{report.category}</Badge>
                    <span className="text-[10px] font-mono text-text-subtle">{report.date}</span>
                  </div>

                  <h3 className="text-sm font-bold text-text-main leading-snug line-clamp-2">{report.title}</h3>
                  <p className="text-[11px] font-mono text-primary-light">{report.submissionId}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between">
                  <span className="text-xs text-text-subtle">Calculated Novelty</span>
                  <span className="font-mono font-extrabold text-success text-lg">{report.noveltyScore}%</span>
                </div>

                <div className="pt-2 border-t border-card-border/60 grid grid-cols-3 gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => navigate(`/dashboard/analysis/${report.submissionId}`)}
                    className="text-[11px] px-2 justify-center"
                  >
                    Inspect
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={() => generatePdfAuditReport(report)}
                    className="text-[11px] px-2 justify-center"
                  >
                    Export
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Share2}
                    onClick={() => setShareReport(report)}
                    className="text-[11px] px-2 justify-center"
                  >
                    Share
                  </Button>
                </div>

              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 space-y-3">
            <FileText className="w-10 h-10 text-text-subtle mx-auto" />
            <h3 className="text-base font-bold text-text-main">No Reports Found</h3>
            <p className="text-xs text-text-muted">No audit reports match your filter or search query.</p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareReport && (
        <ShareReportModal report={shareReport} onClose={() => setShareReport(null)} />
      )}

    </div>
  );
};

export default ReportsView;
