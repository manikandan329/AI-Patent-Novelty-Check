import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { TrendingUp, Network, Sparkles, BarChart3, HelpCircle } from 'lucide-react';
import { TechnologyIntelligenceView } from './TechnologyIntelligenceView';
import { PatentRelationshipView } from './PatentRelationshipView';

export const PatentInsightsHubView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { submissionId } = useParams();

  // Determine active tab
  const getInitialTab = () => {
    const qTab = searchParams.get('tab');
    if (qTab && ['intelligence', 'citations'].includes(qTab)) {
      return qTab;
    }
    if (location.pathname.includes('relationships')) return 'citations';
    return 'intelligence';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    const qTab = searchParams.get('tab');
    if (qTab && ['intelligence', 'citations'].includes(qTab)) {
      setActiveTab(qTab);
    } else if (location.pathname.includes('relationships')) {
      setActiveTab('citations');
    } else if (location.pathname.includes('intelligence') || location.pathname === '/dashboard/insights') {
      setActiveTab('intelligence');
    }
  }, [location.pathname, searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const tabs = [
    {
      id: 'intelligence',
      label: 'Technology Intelligence',
      icon: TrendingUp,
      description: 'Growth trends, domain comparisons & geographic distribution',
    },
    {
      id: 'citations',
      label: 'Citation Graph & Network',
      icon: Network,
      description: 'Prior art citation topology, applicant clusters & family lineages',
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
                <TrendingUp className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-text-main">
                Patent Insights & Ecosystem
              </h1>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Explore macro technology domain trajectories, patent citation networks, and inventor-applicant relationships.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-card-border text-[11px] font-medium text-text-subtle self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-primary-light animate-ping" />
            <span>Patent Intelligence Live</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-card-border/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left group ${
                  isCurrent
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 border border-primary font-bold'
                    : 'bg-[#0F172A]/70 text-text-muted hover:text-text-main hover:bg-[#0F172A] border border-card-border/60'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isCurrent ? 'text-white' : 'text-primary-light'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate">{tab.label}</div>
                  <div
                    className={`text-[10px] truncate font-normal ${
                      isCurrent ? 'text-blue-100' : 'text-text-subtle'
                    }`}
                  >
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active View */}
      <div>
        {activeTab === 'intelligence' && <TechnologyIntelligenceView />}
        {activeTab === 'citations' && <PatentRelationshipView />}
      </div>
    </div>
  );
};

export default PatentInsightsHubView;
