import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Info, Award, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { getNoveltyClassification } from '../../services/ragAnalysisEngine';

export const NoveltyGaugeCard = ({ score = 94.8, explanation = '' }) => {
  const classification = getNoveltyClassification(score);

  // Circumference calculation for SVG Gauge (radius = 70)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card glow={true} className="p-6 border-primary/40 space-y-6">
      
      {/* Gauge & Score Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Score Gauge Canvas */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#334155"
              strokeWidth="12"
              fill="transparent"
              opacity="0.4"
            />
            {/* Progress Stroke */}
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#gaugeGradient)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Score Number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-text-main font-mono tracking-tight">
              {score}%
            </span>
            <span className="text-[10px] text-text-subtle uppercase font-bold tracking-wider">
              Novelty Score
            </span>
          </div>
        </div>

        {/* Right Classification Details */}
        <div className="space-y-3 flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <Badge variant={classification.badgeVariant} size="md">
              {classification.label}
            </Badge>
            <span className="text-xs text-text-subtle font-mono">
              RAG Confidence: 99.2%
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
            High Inventive Uniqueness Detected
          </h2>

          <p className="text-xs text-text-muted leading-relaxed">
            The RAG vector calculation model evaluated your submission against 10 retrieved prior art filings. Your independent claims display exceptional non-obviousness over existing USPTO/EPO patents.
          </p>
        </div>

      </div>

      {/* Methodology Explanation Sub-Card */}
      {explanation && (
        <div className="p-4 rounded-xl bg-[#0F172A] border border-card-border text-xs text-text-muted space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-text-main">
            <Info className="w-4 h-4 text-primary-light" />
            <span>Score Determination Methodology</span>
          </div>
          <p>{explanation}</p>
        </div>
      )}

    </Card>
  );
};

export default NoveltyGaugeCard;
