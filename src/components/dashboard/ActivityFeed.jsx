import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, FileText, RefreshCw, Lightbulb, UploadCloud } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription } from '../ui/Card';

const iconMap = {
  CheckCircle2: CheckCircle2,
  FileText: FileText,
  RefreshCw: RefreshCw,
  Lightbulb: Lightbulb,
  UploadCloud: UploadCloud,
};

export const ActivityFeed = ({ items = [] }) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle>System Activity Feed</CardTitle>
        <CardDescription>Real-time audit log of patent processing events</CardDescription>
      </CardHeader>

      <div className="space-y-4 pt-1 flex-1">
        {items.map((item, idx) => {
          const IconComponent = iconMap[item.iconName] || CheckCircle2;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="flex items-start gap-3 relative pb-3 border-b border-card-border/40 last:border-0 last:pb-0"
            >
              <div className={`p-2 rounded-xl bg-card border border-card-border shrink-0 ${item.iconColor}`}>
                <IconComponent className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-text-main truncate">{item.title}</h4>
                  <span className="text-[10px] text-text-subtle shrink-0 ml-2">{item.timestamp}</span>
                </div>

                <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};

export default ActivityFeed;
