import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { STATS_DATA } from '../../utils/constants';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

const StatCard = ({ stat }) => {
  const [inView, setInView] = useState(false);
  const animatedValue = useAnimatedCounter(stat.value, 2200, inView);

  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true }}
      className="glass-card p-6 rounded-2xl border border-card-border/80 text-center hover:border-primary/40 transition-all"
    >
      <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-main tracking-tight mb-2 flex items-center justify-center font-mono">
        <span>{stat.prefix}</span>
        <span>
          {typeof stat.value === 'number'
            ? animatedValue.toLocaleString(undefined, {
                minimumFractionDigits: Number.isInteger(stat.value) ? 0 : 1,
                maximumFractionDigits: 1,
              })
            : stat.value}
        </span>
        <span className="text-primary-light ml-1">{stat.suffix}</span>
      </div>

      <h4 className="text-base font-bold text-text-main mb-1">{stat.label}</h4>
      <p className="text-xs text-text-subtle">{stat.description}</p>
    </motion.div>
  );
};

export const StatsSection = () => {
  return (
    <section className="py-20 bg-[#0F172A] relative border-y border-card-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS_DATA.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
