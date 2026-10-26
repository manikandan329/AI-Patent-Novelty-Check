import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Card, { CardHeader, CardTitle, CardDescription } from '../ui/Card';

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 rounded-xl border border-card-border shadow-xl text-xs space-y-1">
        <p className="font-bold text-text-main">{data.name}</p>
        <p className="text-primary-light font-semibold">
          {data.count} Filings ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export const TechCategoriesChart = ({ data }) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle>Technology Categories</CardTitle>
        <CardDescription>Domain distribution across analyzed patents</CardDescription>
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
        {/* Doughnut Chart Canvas */}
        <div className="sm:col-span-6 h-52 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0F172A" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Central Label overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-text-main font-mono">128</span>
            <span className="text-[10px] text-text-subtle uppercase">Total IP</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="sm:col-span-6 space-y-2 text-xs">
          {data.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-text-muted truncate">{cat.name}</span>
              </div>
              <span className="font-mono font-bold text-text-main shrink-0 ml-2">
                {cat.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default TechCategoriesChart;
