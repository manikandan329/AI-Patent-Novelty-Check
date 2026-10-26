import React from 'react';
import { motion } from 'framer-motion';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import DashboardCard from '../components/dashboard/DashboardCard';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import NoveltyScoreChart from '../components/dashboard/NoveltyScoreChart';
import TechCategoriesChart from '../components/dashboard/TechCategoriesChart';
import RecentAnalysisTable from '../components/dashboard/RecentAnalysisTable';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import {
  INITIAL_DASHBOARD_STATS,
  MONTHLY_NOVELTY_DATA,
  TECH_CATEGORIES_DATA,
  RECENT_ANALYSES_DATA,
  ACTIVITY_FEED_DATA,
  QUICK_ACTIONS_DATA,
} from '../utils/dashboardData';

export const DashboardPage = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. Welcome Section Banner */}
      <WelcomeBanner />

      {/* 2. Statistics Overview (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {INITIAL_DASHBOARD_STATS.map((stat) => (
          <DashboardCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* 3. Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-subtle">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {QUICK_ACTIONS_DATA.map((action) => (
            <QuickActionCard key={action.id} action={action} />
          ))}
        </div>
      </div>

      {/* 4. Charts Section (2 Recharts Visualizations) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <NoveltyScoreChart data={MONTHLY_NOVELTY_DATA} />
        </div>
        <div className="lg:col-span-5">
          <TechCategoriesChart data={TECH_CATEGORIES_DATA} />
        </div>
      </div>

      {/* 5. Recent Analyses Table & Activity Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <RecentAnalysisTable data={RECENT_ANALYSES_DATA} />
        </div>
        <div className="lg:col-span-4">
          <ActivityFeed items={ACTIVITY_FEED_DATA} />
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
