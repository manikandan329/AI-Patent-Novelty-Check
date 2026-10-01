import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Zap, FileText, History, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';

const iconMap = {
  PlusCircle: PlusCircle,
  Zap: Zap,
  FileText: FileText,
  History: History,
};

export const QuickActionCard = ({ action }) => {
  const navigate = useNavigate();
  const IconComponent = iconMap[action.iconName] || PlusCircle;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(action.path)}
      className="cursor-pointer h-full"
    >
      <Card className={`h-full p-5 border ${action.borderColor} bg-gradient-to-br ${action.color} hover:shadow-lg transition-all group`}>
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-card border border-card-border flex items-center justify-center text-primary-light group-hover:scale-110 transition-transform">
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="w-7 h-7 rounded-lg bg-card/60 border border-card-border/60 flex items-center justify-center text-text-subtle group-hover:text-primary-light group-hover:translate-x-1 transition-all">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <h3 className="text-base font-bold text-text-main group-hover:text-primary-light transition-colors mb-1">
          {action.title}
        </h3>

        <p className="text-xs text-text-muted leading-relaxed">
          {action.description}
        </p>
      </Card>
    </motion.div>
  );
};

export default QuickActionCard;
