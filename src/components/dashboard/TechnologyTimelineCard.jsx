import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Award, ArrowRight } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Badge from '../ui/Badge';

export const TechnologyTimelineCard = ({ milestones = [] }) => {
  return (
    <Card className="p-6 space-y-6">
      <CardHeader className="mb-0">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-light" />
          Chronological Technology Evolution Timeline
        </CardTitle>
        <CardDescription>
          Historical progression of core patent milestones leading to your submitted invention.
        </CardDescription>
      </CardHeader>

      <div className="relative pl-6 border-l-2 border-primary/30 space-y-6 pt-2">
        {milestones.map((m, idx) => (
          <motion.div
            key={m.year}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="relative space-y-1"
          >
            {/* Timeline dot */}
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#0F172A] border-2 border-primary flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={idx === milestones.length - 1 ? 'success' : 'primary'} size="sm" className="font-mono">
                {m.year}
              </Badge>
              {idx === milestones.length - 1 && (
                <span className="text-[10px] font-bold text-success uppercase">Current Innovation Benchmark</span>
              )}
            </div>

            <p className="text-xs font-bold text-text-main leading-relaxed pt-1">
              {m.event}
            </p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default TechnologyTimelineCard;
