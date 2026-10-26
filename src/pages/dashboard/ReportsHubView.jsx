import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FileText, ArrowLeft, PlusCircle, Sparkles, FolderKanban } from 'lucide-react';
import { ReportsView } from './ReportsView';
import PatentAnalysisReportView from './PatentAnalysisReportView';
import Button from '../../components/ui/Button';

export const ReportsHubView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { reportId, submissionId } = useParams();

  // If URL explicitly points to /report or has a reportId/submissionId, show the detail report view
  const isDirectReport = Boolean(
    reportId ||
    submissionId ||
    location.pathname === '/dashboard/report' ||
    location.pathname.startsWith('/dashboard/report/') ||
    searchParams.get('tab') === 'viewer'
  );

  const [activeTab, setActiveTab] = useState(isDirectReport ? 'viewer' : 'list');

  useEffect(() => {
    if (
      reportId ||
      submissionId ||
      location.pathname === '/dashboard/report' ||
      location.pathname.startsWith('/dashboard/report/') ||
      searchParams.get('tab') === 'viewer'
    ) {
      setActiveTab('viewer');
    } else {
      setActiveTab('list');
    }
  }, [location.pathname, reportId, submissionId, searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'list') {
      navigate('/dashboard/reports');
    } else {
      navigate('/dashboard/report');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header & Mode Toggle */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl border border-card-border/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-success/10 border border-success/30 flex items-center justify-center text-success">
                <FileText className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-text-main">
                Reports & Audit Center
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Generate, inspect, download, and share comprehensive 16-section patent novelty audit reports.
            </p>
          </div>

          {/* Quick Toggle Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange('list')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'bg-primary text-white shadow-md font-bold'
                  : 'bg-[#0F172A] text-text-muted hover:text-text-main border border-card-border'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>All Reports</span>
            </button>

            <button
              onClick={() => handleTabChange('viewer')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'viewer'
                  ? 'bg-primary text-white shadow-md font-bold'
                  : 'bg-[#0F172A] text-text-muted hover:text-text-main border border-card-border'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-light" />
              <span>Generate / Inspect Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Active View */}
      <div>
        {activeTab === 'list' ? (
          <ReportsView />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
                onClick={() => handleTabChange('list')}
              >
                Back to Reports Library
              </Button>
            </div>
            <PatentAnalysisReportView />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsHubView;
