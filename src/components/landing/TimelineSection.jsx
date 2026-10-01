import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Zap, GitCompare, BarChart3, Download, ArrowDown } from 'lucide-react';
import { TIMELINE_STEPS } from '../../utils/constants';
import Badge from '../ui/Badge';

const iconMap = {
  UploadCloud: UploadCloud,
  Zap: Zap,
  GitCompare: GitCompare,
  BarChart3: BarChart3,
  Download: Download,
};

export const TimelineSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-[#0B1120] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary-light bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
            Seamless Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">
            How Patentiq AI <span className="text-gradient-primary">Evaluates Novelty</span>
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            From raw draft text to an audit-ready legal novelty report in five straightforward steps.
          </p>
        </div>

        {/* Vertical/Horizontal Timeline */}
        <div className="max-w-4xl mx-auto relative">
          
          {/* Central Connecting Line for Desktop */}
          <div className="hidden md:block absolute left-1/2 top-10 bottom-10 -translate-x-1/2 w-0.5 bg-gradient-to-b from-primary via-secondary to-success opacity-30 pointer-events-none" />

          <div className="space-y-12 relative z-10">
            {TIMELINE_STEPS.map((step, idx) => {
              const IconComponent = iconMap[step.iconName] || UploadCloud;
              const isEven = idx % 2 === 0;

              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex flex-col md:flex-row items-center gap-6"
                >
                  {/* Left Content Box */}
                  <div className={`w-full md:w-1/2 text-center ${isEven ? 'md:text-right md:pr-10' : 'md:order-2 md:text-left md:pl-10'}`}>
                    <div className="glass-card p-6 rounded-2xl border border-card-border hover:border-primary/40 transition-all duration-300">
                      <div className={`flex items-center gap-2 mb-2 ${isEven ? 'justify-center md:justify-end' : 'justify-center md:justify-start'}`}>
                        <span className="text-xs font-mono font-bold text-primary-light uppercase tracking-wider">
                          Step 0{step.step}
                        </span>
                        <Badge variant="secondary" size="sm">
                          {step.badgeText}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold text-text-main mb-2">
                        {step.title}
                      </h3>

                      <p className="text-sm text-text-muted leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Timeline Node Icon */}
                  <div className="relative shrink-0 flex items-center justify-center my-2 md:my-0">
                    <div className="w-14 h-14 rounded-2xl bg-card border-2 border-primary/50 shadow-glow-primary flex items-center justify-center text-primary-light z-10 hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {/* Step indicator arrow indicator between steps for mobile */}
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <div className="block md:hidden text-primary/50 mt-4">
                        <ArrowDown className="w-5 h-5 animate-bounce" />
                      </div>
                    )}
                  </div>

                  {/* Empty Right Content Space for Desktop Symmetry */}
                  <div className={`hidden md:block w-1/2 ${isEven ? 'order-2' : 'order-1'}`} />
                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

export default TimelineSection;
