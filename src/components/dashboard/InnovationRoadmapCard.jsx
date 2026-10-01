import React from 'react';
import { motion } from 'framer-motion';
import { Compass, CheckCircle2, ArrowRight, Zap, Award } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Badge from '../ui/Badge';

export const InnovationRoadmapCard = ({ roadmap = [] }) => {
  return (
    <Card className="p-6 space-y-6">
      <CardHeader className="mb-0">
        <CardTitle className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary-light" />
          3-Stage Patent Enhancement Roadmap
        </CardTitle>
        <CardDescription>
          Step-by-step phased execution plan to elevate patent novelty and commercial grant probability.
        </CardDescription>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {roadmap.map((stage, idx) => (
          <motion.div
            key={stage.stage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="p-5 rounded-2xl bg-[#0F172A] border border-card-border hover:border-primary/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={idx === 0 ? 'success' : idx === 1 ? 'primary' : 'secondary'} size="sm">
                  {stage.stage}
                </Badge>
                <span className="text-[10px] font-mono text-text-subtle">{stage.phase}</span>
              </div>

              <h3 className="text-sm font-bold text-text-main leading-snug">{stage.title}</h3>

              <ul className="space-y-2 text-xs text-text-muted pt-2 border-t border-card-border/60">
                {(stage.tasks || []).map((t, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-card border border-card-border text-[11px] font-bold text-success flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>{stage.impact}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default InnovationRoadmapCard;
