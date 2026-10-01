import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Card, { CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Badge from '../ui/Badge';

export const VisualAnalyticsGrid = ({ chartsData = {} }) => {
  const radarData = chartsData.radarData || [];
  const domainData = chartsData.domainDistribution || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. Innovation Radar Chart */}
      <div className="lg:col-span-6">
        <Card className="h-full flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Innovation Radar Analysis</CardTitle>
            <CardDescription>Multi-axis novelty metrics vs USPTO benchmarks</CardDescription>
          </CardHeader>

          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" opacity={0.5} />
                <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" fontSize={10} />
                <Radar
                  name="Novelty Score"
                  dataKey="score"
                  stroke="#2563EB"
                  fill="#2563EB"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 2. Patent Relationship Flow Graph */}
      <div className="lg:col-span-6">
        <Card className="h-full flex flex-col justify-between p-6">
          <CardHeader>
            <CardTitle>Patent Relationship Map</CardTitle>
            <CardDescription>Prior art citations & dependency topology</CardDescription>
          </CardHeader>

          <div className="p-4 rounded-2xl bg-[#0F172A] border border-card-border space-y-4 my-auto">
            
            {/* User Core node */}
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/40 text-center">
              <Badge variant="primary" size="sm">Submitted Patent</Badge>
              <p className="text-xs font-bold text-text-main mt-1">
                Quantum Micro-Fluidic Neural Processing Unit
              </p>
            </div>

            {/* Connecting lines */}
            <div className="flex justify-around items-center text-xs text-text-subtle font-mono">
              <span>↙ 94.8% Match</span>
              <span>↓ 88.2% Match</span>
              <span>↘ 96.1% Match</span>
            </div>

            {/* Prior Art Matches node grid */}
            <div className="grid grid-cols-3 gap-2 text-[10px] text-center font-mono">
              <div className="p-2 rounded-lg bg-card border border-card-border">
                <span className="text-primary-light font-bold">US-2026-0098412</span>
                <p className="text-text-subtle truncate">Quantum</p>
              </div>
              <div className="p-2 rounded-lg bg-card border border-card-border">
                <span className="text-secondary-light font-bold">US-2026-0084719</span>
                <p className="text-text-subtle truncate">Robotics</p>
              </div>
              <div className="p-2 rounded-lg bg-card border border-card-border">
                <span className="text-success font-bold">EP-3940192-B1</span>
                <p className="text-text-subtle truncate">Biotech</p>
              </div>
            </div>

          </div>
        </Card>
      </div>

    </div>
  );
};

export default VisualAnalyticsGrid;
