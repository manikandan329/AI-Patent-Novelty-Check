import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, ArrowUpRight, CheckCircle2, History, Plus } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Badge from '../ui/Badge';

export const PatentVersioningCard = ({ versionHistory = [] }) => {
  return (
    <Card className="p-6 space-y-6">
      <CardHeader className="mb-0">
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary-light" />
          Patent Versioning & Innovation Iterations
        </CardTitle>
        <CardDescription>
          Track novelty score progression as AI recommendations are applied across iteration stages.
        </CardDescription>
      </CardHeader>

      <div className="overflow-x-auto rounded-xl border border-card-border/60">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0F172A] font-bold text-text-subtle uppercase border-b border-card-border">
              <th className="py-3.5 px-4">Patent Version</th>
              <th className="py-3.5 px-4">Novelty Score</th>
              <th className="py-3.5 px-4">Innovation Rating</th>
              <th className="py-3.5 px-4">Applied AI Changes</th>
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border/40">
            {versionHistory.map((v, idx) => (
              <tr key={idx} className="hover:bg-card/60 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-text-main">
                  {v.version}
                </td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-success">
                  {v.noveltyScore}%
                </td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-primary-light">
                  {v.innovationScore}%
                </td>
                <td className="py-3.5 px-4 text-text-muted">
                  {v.appliedCount} Recommendations Applied ({v.note})
                </td>
                <td className="py-3.5 px-4 font-mono text-text-subtle">
                  {v.timestamp}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Badge variant={idx === 0 ? 'success' : 'outline'} size="sm">
                    {idx === 0 ? 'Active Version' : 'Historical Snapshot'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PatentVersioningCard;
