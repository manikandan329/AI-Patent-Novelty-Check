import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../../utils/constants';
import Card from '../ui/Card';

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-[#0B1120] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-light bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Trusted Worldwide
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">
            What IP Leaders Say About <span className="text-gradient-primary">Patentiq AI</span>
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Empowering top IP law firms, biotechnology companies, and tech enterprises.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS_DATA.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
            >
              <Card className="h-full flex flex-col justify-between relative overflow-hidden group hover:border-primary/40">
                <Quote className="absolute top-4 right-4 w-10 h-10 text-card-border/40 group-hover:text-primary/20 transition-colors pointer-events-none" />

                <div className="space-y-4 relative z-10">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  <p className="text-sm text-text-muted italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>

                {/* User Author info */}
                <div className="flex items-center gap-3 pt-6 mt-6 border-t border-card-border/50">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border border-card-border"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-text-main">{t.name}</h4>
                    <p className="text-xs text-text-subtle">{t.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
