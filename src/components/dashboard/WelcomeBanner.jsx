import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, PlusCircle, Zap, ShieldCheck, Activity, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

export const WelcomeBanner = () => {
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();

  const isDemoActive = userProfile?.isDemoMode || currentUser?.isDemo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 sm:p-8 rounded-2xl border border-primary/30 shadow-glow-primary relative overflow-hidden bg-hero-gradient space-y-4"
    >
      {/* Background glow orb */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {isDemoActive && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 font-medium">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <b>Demo Account Active:</b> You are logged in as <b>Demo User (demo@patentiq.com)</b>. All patent novelty tools & sample datasets are unlocked for college project review.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-[10px] font-extrabold uppercase border border-amber-500/40 shrink-0 hidden sm:inline-block">
            Project Preview Mode
          </span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left Column: Greeting & Status */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-xs font-bold text-success">
            <span className="w-2 h-2 rounded-full bg-success animate-ping" />
            <span>All AI Systems Operational • 99.9% Vector Accuracy</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Welcome back, <span className="text-gradient-primary">{userProfile?.name || 'Inventor'}</span>
          </h1>

          <p className="text-xs sm:text-sm text-text-muted max-w-xl leading-relaxed">
            Ready to evaluate your latest technical claim draft against 140M+ USPTO and WIPO filings today?
          </p>
        </div>

        {/* Right Column: Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            icon={PlusCircle}
            onClick={() => navigate('/dashboard/new-analysis')}
            className="w-full sm:w-auto shadow-glow-primary"
          >
            Submit New Patent
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon={Zap}
            onClick={() => navigate('/dashboard/new-analysis')}
            className="w-full sm:w-auto"
          >
            Run AI Analysis
          </Button>
        </div>

      </div>
    </motion.div>
  );
};

export default WelcomeBanner;
