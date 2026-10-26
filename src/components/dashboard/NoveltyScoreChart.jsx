import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Card, { CardHeader, CardTitle, CardDescription } from '../ui/Card';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-xl border border-card-border shadow-xl text-xs space-y-1">
        <p className="font-bold text-text-main">{label} 2026</p>
        <p className="text-primary-light font-semibold">
          Avg Novelty Score: {payload[0].value}%
        </p>
        <p className="text-text-subtle">
          Analyses Processed: {payload[0].payload.totalAnalyses} filings
        </p>
      </div>
    );
  }
  return null;
};

export const NoveltyScoreChart = ({ data }) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Novelty Score Distribution</CardTitle>
            <CardDescription>Monthly average novelty score trend (%)</CardDescription>
          </div>
          <span className="text-xs font-mono font-bold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
            Avg: 92.4%
          </span>
        </div>
      </CardHeader>

      <div className="w-full h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis
              dataKey="month"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              domain={[60, 100]}
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="averageScore"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default NoveltyScoreChart;
