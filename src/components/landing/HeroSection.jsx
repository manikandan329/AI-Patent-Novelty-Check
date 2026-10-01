import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Search, CheckCircle2, FileText, BarChart } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden bg-hero-gradient">
      {/* Background glow ORBs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-primary-light animate-pulse" />
              <span className="text-xs font-semibold text-primary-light">
                Enterprise AI Patent Novelty Engine v2.4
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-main tracking-tight leading-[1.15]">
              Verify Patent <span className="text-gradient-primary">Novelty & Prior Art</span> in Seconds
            </h1>

            <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Cross-reference technical claims against 140M+ USPTO, WIPO, and EPO filings using vector semantic search. Identify overlapping prior art, assess grant risk, and export institutional PDF audit reports.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full sm:w-auto shadow-glow-primary hover:shadow-primary/50"
                >
                  Analyze Patent Novelty Free
                </Button>
              </Link>

              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore Architecture
                </Button>
              </a>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-6 border-t border-card-border/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-text-subtle">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>140M+ Global Patent Corpus</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>94.2% Examiner Correlation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>AES-256 IP Encrypted</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Mockup Preview Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Outer card shell */}
            <div className="glass-card rounded-2xl p-5 border border-card-border shadow-2xl relative overflow-hidden bg-grid-pattern">
              
              {/* Top Card Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-card-border/60 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger/70" />
                  <div className="w-3 h-3 rounded-full bg-warning/70" />
                  <div className="w-3 h-3 rounded-full bg-success/70" />
                  <span className="text-xs text-text-subtle font-mono ml-2">patentiq-analyzer-v2.py</span>
                </div>
                <Badge variant="success" size="sm">
                  Live Engine Active
                </Badge>
              </div>

              {/* Sample Patent Header */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#0F172A]/90 border border-card-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono text-primary-light">US-2026-0098412-A1</span>
                    <span className="text-[10px] text-text-subtle">Confidence: 99.4%</span>
                  </div>
                  <h4 className="text-xs font-bold text-text-main">
                    Quantum Micro-Fluidic Neural Processing Unit
                  </h4>
                </div>

                {/* Score Widget Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-card border border-primary/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-text-subtle uppercase">Novelty Score</span>
                      <p className="text-xl font-extrabold text-success">92.8 / 100</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
                      <BarChart className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-secondary/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-text-subtle uppercase">Prior Art Matches</span>
                      <p className="text-xl font-extrabold text-secondary-light">3 Filings</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary-light">
                      <Search className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Claim Overlap Breakdown */}
                <div className="p-3.5 rounded-xl bg-[#0F172A]/90 border border-card-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted font-medium">Independent Claim 1 Overlap</span>
                    <span className="text-xs font-mono text-warning">8.4% Low Risk</span>
                  </div>
                  <div className="w-full bg-card-border/80 h-2 rounded-full overflow-hidden">
                    <div className="bg-warning h-full w-[8.4%] rounded-full" />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-text-muted font-medium">Inventive Step Uniqueness</span>
                    <span className="text-xs font-mono text-success">94.1% High</span>
                  </div>
                  <div className="w-full bg-card-border/80 h-2 rounded-full overflow-hidden">
                    <div className="bg-success h-full w-[94.1%] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Floating Badge Overlay */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-2 -right-2 glass-panel p-3 rounded-xl border border-primary/40 shadow-xl flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-main">Audit PDF Ready</p>
                  <p className="text-[10px] text-text-subtle">Citations & Claim Risk Map</p>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
