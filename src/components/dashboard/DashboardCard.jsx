import React from 'react';
import { motion } from 'framer-motion';
import { FileSearch, Sparkles, FileText, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../ui/Card';

const iconMap = {
  FileSearch: FileSearch,
  Sparkles: Sparkles,
  FileText: FileText,
  Clock: Clock,
};

export const DashboardCard = ({ stat }) => {
  const IconComponent = iconMap[stat.iconName] || FileSearch;
  const isPositive = stat.growthType === 'positive';

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="h-full flex flex-col justify-between p-5 border-card-border/80 hover:border-primary/40 transition-all">
        
        {/* Top Icon & Title */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-text-muted">{stat.title}</span>
          <div className="w-9 h-9 rounded-xl bg-card border border-card-border flex items-center justify-center text-primary-light shadow-sm">
            <IconComponent className="w-4 h-4" />
          </div>
        </div>

        {/* Statistic Value */}
        <div className="space-y-1 my-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight font-mono">
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            <span className="text-lg text-primary-light ml-0.5">{stat.unit}</span>
          </div>

          <p className="text-xs text-text-subtle">{stat.subtitle}</p>
        </div>

        {/* Growth Footer */}
        <div className="pt-3 border-t border-card-border/40 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1 font-bold ${isPositive ? 'text-success' : 'text-text-muted'}`}>
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : null}
            <span>{stat.growth}</span>
          </div>
          <span className="text-[10px] text-text-subtle uppercase">vs last month</span>
        </div>

      </Card>
    </motion.div>
  );
};

export default DashboardCard;
