import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History, Search, GitCompare, Eye, Download, Trash2, Heart, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUserReportsList, toggleFavoriteReport, deleteReportDocument } from '../../services/reportManagementService';
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { generatePdfAuditReport } from '../../utils/pdfReportGenerator';
import toast from 'react-hot-toast';

export const HistoryView = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  useEffect(() => {
    getUserReportsList(currentUser?.uid).then(setReports);
  }, [currentUser]);

  const handleToggleFavorite = async (reportId, currentFav) => {
    const updated = await toggleFavoriteReport(currentUser?.uid, reportId, currentFav);
    setReports(updated);
    toast.success(currentFav ? 'Removed from favorites' : 'Added to favorites!', { icon: '❤️' });
  };

  const handleDelete = async (reportId, title) => {
    if (window.confirm(`Are you sure you want to delete report "${title}"?`)) {
      const updated = await deleteReportDocument(currentUser?.uid, reportId);
      setReports(updated);
      toast.success('Report deleted successfully');
    }
  };

  const handleCheckboxToggle = (report) => {
    const isSelected = selectedForCompare.some((r) => r.submissionId === report.submissionId);
    if (isSelected) {
      setSelectedForCompare(selectedForCompare.filter((r) => r.submissionId !== report.submissionId));
    } else {
      if (selectedForCompare.length >= 4) {
        toast.error('You can compare a maximum of 4 patents side-by-side.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, report]);
    }
  };

  const handleCompareClick = () => {
    if (selectedForCompare.length < 2) {
      toast.error('Please select at least 2 patent reports to compare.');
      return;
    }
    navigate('/dashboard/compare', { state: { selectedReports: selectedForCompare } });
  };

  const filtered = reports.filter((r) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.submissionId.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      
      {/* Header & Compare Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-card-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-text-main">History Archive</h1>
            <Badge variant="primary" size="sm">{reports.length} Archived Scans</Badge>
          </div>
          <p className="text-xs text-text-muted">
            Complete chronological audit trail of all patent novelty evaluations and prior art searches.
          </p>
        </div>

        {/* Compare Action Button */}
        <div className="flex items-center gap-2">
          {selectedForCompare.length >= 2 && (
            <Button
              variant="primary"
              size="md"
              icon={GitCompare}
              onClick={handleCompareClick}
              className="shadow-glow-primary"
            >
              Compare Selected ({selectedForCompare.length})
            </Button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="p-6 space-y-4">
        
        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Patent Analysis Trail</CardTitle>
            <CardDescription>Select 2+ patents to launch multi-patent comparison matrix</CardDescription>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history by title or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0F172A] border border-card-border rounded-xl py-2 pl-10 pr-3 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto rounded-xl border border-card-border/60">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0F172A]/90 font-bold text-text-subtle uppercase tracking-wider border-b border-card-border/60">
                <th className="py-3.5 px-4 w-10 text-center">Compare</th>
                <th className="py-3.5 px-4">Patent Title & ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Novelty Score</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/40">
              {filtered.map((r) => {
                const isSelected = selectedForCompare.some((item) => item.submissionId === r.submissionId);

                return (
                  <tr key={r.reportId || r.submissionId} className="hover:bg-card/60 transition-colors">
                    
                    {/* Checkbox */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCheckboxToggle(r)}
                        className="rounded border-card-border bg-[#0F172A] text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      />
                    </td>

                    {/* Title & ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-text-main max-w-sm truncate">{r.title}</div>
                      <div className="text-[10px] text-text-subtle font-mono">{r.submissionId} • {r.category}</div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-text-muted">{r.date || '2026-07-25'}</td>

                    {/* Score */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-extrabold text-sm text-success">{r.noveltyScore}%</span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          r.status === 'Completed'
                            ? 'success'
                            : r.status === 'Archived'
                            ? 'outline'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {r.status || 'Completed'}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleFavorite(r.reportId, r.favorite)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            r.favorite ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-card border-card-border text-text-subtle hover:text-rose-400'
                          }`}
                          title="Favorite"
                        >
                          <Heart className={`w-3.5 h-3.5 ${r.favorite ? 'fill-current' : ''}`} />
                        </button>

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => navigate(`/dashboard/analysis/${r.submissionId}`)}
                        >
                          Inspect
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          icon={Download}
                          onClick={() => generatePdfAuditReport(r)}
                        >
                          PDF
                        </Button>

                        <button
                          onClick={() => handleDelete(r.reportId, r.title)}
                          className="p-1.5 rounded-lg text-text-subtle hover:text-danger hover:bg-danger/10 transition-colors"
                          title="Delete report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};

export default HistoryView;
