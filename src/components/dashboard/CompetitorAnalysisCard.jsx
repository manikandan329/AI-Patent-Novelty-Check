import React from 'react';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Award, Layers } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Badge from '../ui/Badge';

export const CompetitorAnalysisCard = ({ topCompanies = [] }) => {
  return (
    <Card className="p-6 space-y-4">
      <CardHeader className="mb-0">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-light" />
          Top Corporate Competitors & Patent Filers
        </CardTitle>
        <CardDescription>
          Market leadership positions and primary technical focus area breakdown.
        </CardDescription>
      </CardHeader>

      <div className="overflow-x-auto rounded-xl border border-card-border/60">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0F172A] font-bold text-text-subtle uppercase border-b border-card-border">
              <th className="py-3.5 px-4">Company Name</th>
              <th className="py-3.5 px-4">Patent Count</th>
              <th className="py-3.5 px-4">Primary Technology Focus</th>
              <th className="py-3.5 px-4">Market Position</th>
              <th className="py-3.5 px-4 text-right">Market Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border/40">
            {topCompanies.map((c, idx) => (
              <tr key={idx} className="hover:bg-card/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-text-main">
                  {c.company}
                </td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-primary-light">
                  {c.patentCount.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-text-muted leading-relaxed max-w-sm">
                  {c.techFocus}
                </td>
                <td className="py-3.5 px-4">
                  <Badge
                    variant={
                      c.marketPosition.includes('Dominant')
                        ? 'success'
                        : c.marketPosition.includes('Fast')
                        ? 'primary'
                        : 'outline'
                    }
                    size="sm"
                  >
                    {c.marketPosition}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 font-mono text-right font-bold text-success">
                  {c.share}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default CompetitorAnalysisCard;
