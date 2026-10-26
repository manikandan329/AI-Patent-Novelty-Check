import React from 'react';
import Card, { CardTitle, CardDescription } from '../ui/Card';
import Badge from '../ui/Badge';

export const FeatureComparisonMatrix = ({ features = [] }) => {
  return (
    <Card className="p-6 space-y-4">
      <div>
        <CardTitle>Intelligent Feature Comparison Matrix</CardTitle>
        <CardDescription>
          Detailed claim element comparison against retrieved prior art references.
        </CardDescription>
      </div>

      <div className="overflow-x-auto rounded-xl border border-card-border/60">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0F172A]/90 font-bold text-text-subtle uppercase tracking-wider border-b border-card-border/60">
              <th className="py-3 px-4">User Submitted Feature</th>
              <th className="py-3 px-4">Closest Prior Art Match</th>
              <th className="py-3 px-4">Overlap %</th>
              <th className="py-3 px-4">Key Technical Difference</th>
              <th className="py-3 px-4 text-right">Uniqueness</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border/40">
            {features.map((item) => (
              <tr key={item.id} className="hover:bg-card/60 transition-colors">
                <td className="py-3 px-4 font-bold text-text-main max-w-xs leading-snug">
                  {item.userFeature}
                </td>
                <td className="py-3 px-4">
                  <div className="font-mono font-bold text-primary-light">{item.patentMatch}</div>
                  <div className="text-[10px] text-text-subtle truncate max-w-[180px]">
                    {item.matchedTitle}
                  </div>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-warning">
                  {item.similarityScore}%
                </td>
                <td className="py-3 px-4 text-text-muted leading-relaxed max-w-sm">
                  {item.difference}
                </td>
                <td className="py-3 px-4 text-right">
                  <Badge
                    variant={
                      item.uniqueness.includes('High') || item.uniqueness === 'Very High'
                        ? 'success'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {item.uniqueness}
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

export default FeatureComparisonMatrix;
