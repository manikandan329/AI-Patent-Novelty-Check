import React from 'react';
import Card, { CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Badge from '../ui/Badge';

export const ApiEndpointMonitorTable = ({ apiEndpoints = [] }) => {
  return (
    <Card className="p-6 space-y-4">
      <CardHeader className="mb-0">
        <CardTitle className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
          FastAPI Endpoint Telemetry & Latency Monitor
        </CardTitle>
        <CardDescription>
          Real-time API response times, HTTP status codes, throughput, and error rates.
        </CardDescription>
      </CardHeader>

      <div className="overflow-x-auto rounded-xl border border-card-border/60">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-[#0F172A] font-bold text-text-subtle uppercase border-b border-card-border">
              <th className="py-3.5 px-4">API Endpoint</th>
              <th className="py-3.5 px-4">Method</th>
              <th className="py-3.5 px-4">Avg Latency</th>
              <th className="py-3.5 px-4">HTTP Status</th>
              <th className="py-3.5 px-4">Total Requests</th>
              <th className="py-3.5 px-4">Failed Requests</th>
              <th className="py-3.5 px-4 text-right">Error Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border/40">
            {apiEndpoints.map((item, idx) => (
              <tr key={idx} className="hover:bg-card/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-primary-light">{item.endpoint}</td>
                <td className="py-3.5 px-4">
                  <Badge variant="outline" size="sm">{item.method}</Badge>
                </td>
                <td className="py-3.5 px-4 font-bold text-text-main">{item.avgLatency}</td>
                <td className="py-3.5 px-4">
                  <span className="text-success font-bold">{item.statusCode} OK</span>
                </td>
                <td className="py-3.5 px-4 text-text-muted">{item.totalRequests.toLocaleString()}</td>
                <td className="py-3.5 px-4 text-text-subtle">{item.failedRequests}</td>
                <td className="py-3.5 px-4 text-right font-bold text-success">{item.errorRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ApiEndpointMonitorTable;
