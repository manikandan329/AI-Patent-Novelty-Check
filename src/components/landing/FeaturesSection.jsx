import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Search, Sparkles, Layers, Lightbulb, FileText } from 'lucide-react';
import { FEATURES_DATA } from '../../utils/constants';
import Card from '../ui/Card';

const iconMap = {
  Cpu: Cpu,
  Search: Search,
  Sparkles: Sparkles,
  Layers: Layers,
  Lightbulb: Lightbulb,
  FileText: FileText,
};

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-[#0F172A] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-light bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Intelligent Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">
            Comprehensive AI Capabilities for <span className="text-gradient-primary">IP Professionals</span>
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Built specifically for patent attorneys, enterprise R&D directors, and startup founders needing rapid, accurate prior art evaluations.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES_DATA.map((feature, idx) => {
            const IconComponent = iconMap[feature.iconName] || Cpu;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card
                  hoverEffect={true}
                  className="h-full group hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Glowing background accent on hover */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.accentColor} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-300 pointer-events-none`} />

                  <div className="space-y-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-card border border-card-border group-hover:border-primary/50 flex items-center justify-center text-primary-light group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300 shadow-md">
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-bold text-text-main group-hover:text-primary-light transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-sm text-text-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
