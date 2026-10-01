import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  Sparkles,
  Layers,
  Activity,
  Calendar,
  Building,
  User,
  GitCompare,
  ArrowRight,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  buildPatentRelationshipGraph,
  calculateNetworkMetrics,
  generateTimelineAnalysis,
  extractApplicantAndInventorNetworks,
  TECHNOLOGY_CLUSTERS,
  exportNetworkData,
  savePatentRelationshipsData,
} from '../../services/patentRelationshipService';
import { getProcessedPatentSubmission, TECHNOLOGY_DOMAINS } from '../../services/patentDocumentProcessor';

export const PatentRelationshipView = () => {
  const { submissionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const effSubmissionId = submissionId || location.state?.submissionId || 'SUB-2026-98142';

  // Filters State
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [relationshipType, setRelationshipType] = useState('All');
  const [yearRange, setYearRange] = useState([2018, 2026]);
  const [minCitations, setMinCitations] = useState(0);
  const [nodeSearch, setNodeSearch] = useState('');

  // Graph State
  const [userInvention, setUserInvention] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [metrics, setMetrics] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState('graph'); // 'graph' | 'clusters' | 'timeline' | 'networks' | 'influential' | 'analytics'
  const [zoomLevel, setZoomLevel] = useState(1);

  // Load User Invention Data & Build Graph
  useEffect(() => {
    getProcessedPatentSubmission(effSubmissionId).then((data) => {
      const inv = data || {
        submission_id: effSubmissionId,
        title: 'Autonomous Precision Irrigation System using Soil Moisture & Weather Intelligence',
        technology_domain: 'Agriculture & AgTech',
        organization: 'AgriTech Automation Corp',
        inventorName: 'Dr. Johnathan Miller',
      };
      setUserInvention(inv);

      const builtGraph = buildPatentRelationshipGraph(inv, {
        domain: selectedDomain,
        relationshipType,
        yearRange,
        minCitations,
      });

      const computedMetrics = calculateNetworkMetrics(builtGraph.nodes, builtGraph.edges);

      setGraphData(builtGraph);
      setMetrics(computedMetrics);
    });
  }, [effSubmissionId, selectedDomain, relationshipType, yearRange, minCitations]);

  const timelineData = generateTimelineAnalysis();
  const { applicantsList, inventorsList } = extractApplicantAndInventorNetworks();

  // Search Node in Graph
  const highlightedNodeId = nodeSearch.trim()
    ? graphData.nodes.find((n) => n.patentId.toLowerCase().includes(nodeSearch.toLowerCase()) || n.title.toLowerCase().includes(nodeSearch.toLowerCase()))?.id
    : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 animate-fadeIn">
      
      {/* Top Header & Sticky Control Bar */}
      <div className="sticky top-16 z-30 bg-[#0B1120]/90 backdrop-blur-md p-4 rounded-2xl border border-card-border shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Module 15 Relationship Topology</Badge>
              <span className="text-xs text-text-subtle font-mono">{effSubmissionId}</span>
            </div>
            <h1 className="text-xl font-extrabold text-text-main">
              Patent Citation & Relationship Network Analysis
            </h1>
          </div>

          {/* Export Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" icon={FileCode} onClick={() => exportNetworkData('json', graphData, metrics)}>
              JSON Graph
            </Button>
            <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={() => exportNetworkData('csv', graphData, metrics)}>
              CSV Matrix
            </Button>
            <Button variant="primary" size="sm" icon={Download} onClick={() => exportNetworkData('pdf', graphData, metrics)}>
              Export PDF Report
            </Button>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-card-border/60 text-xs">
          
          {/* Node Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-text-subtle absolute left-3 top-2.5" />
            <input
              type="text"
              value={nodeSearch}
              onChange={(e) => setNodeSearch(e.target.value)}
              placeholder="Search node in graph by Patent ID or Title..."
              className="w-full bg-[#0F172A] border border-card-border text-text-main text-xs rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Relationship Filter */}
          <div className="flex items-center gap-2">
            <span className="text-text-subtle font-bold">Edge Type:</span>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
              className="bg-[#0F172A] border border-card-border text-text-main text-xs rounded-xl px-3 py-1.5 focus:outline-none"
            >
              <option value="All">All Relationships</option>
              <option value="Citation">Legal Direct Citations Only</option>
              <option value="Semantic">Semantic Vector Overlaps Only</option>
              <option value="Applicant">Same Applicant Portfolio</option>
            </select>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-[#0F172A] p-1 rounded-xl border border-card-border">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
              className="p-1 text-text-muted hover:text-text-main"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="font-mono text-[10px] px-1 text-primary-light font-bold">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.6))}
              className="p-1 text-text-muted hover:text-text-main"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-text-muted hover:text-text-main ml-1 border-l border-card-border pl-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-card-border pb-3">
        {[
          { id: 'graph', label: 'Network Landscape Graph', icon: Network },
          { id: 'clusters', label: 'Technology Clusters', icon: Layers },
          { id: 'timeline', label: 'Timeline Evolution', icon: Calendar },
          { id: 'networks', label: 'Applicant & Inventor Networks', icon: Building },
          { id: 'influential', label: 'Influential Patents (PageRank)', icon: TrendingUp },
          { id: 'analytics', label: 'Network Analytics', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-card text-text-muted hover:text-text-main border border-card-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: INTERACTIVE PATENT LANDSCAPE GRAPH VISUALIZER */}
      {activeTab === 'graph' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* DYNAMIC FILTER SIDEBAR */}
          <Card className="p-5 space-y-5 lg:col-span-1 h-fit">
            <div className="flex items-center justify-between border-b border-card-border pb-3">
              <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-primary-light" /> Graph Filters
              </span>
              <button
                onClick={() => {
                  setSelectedDomain('All');
                  setRelationshipType('All');
                  setYearRange([2018, 2026]);
                  setMinCitations(0);
                }}
                className="text-[10px] text-primary-light hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Domain Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-subtle">Technology Domain</label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full bg-[#0F172A] border border-card-border text-text-main text-xs rounded-xl p-2 focus:outline-none"
              >
                <option value="All">All Domains</option>
                {TECHNOLOGY_DOMAINS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Min Citations Filter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-text-subtle">Min Citation Count</span>
                <span className="font-mono text-primary-light font-bold">{minCitations}</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={minCitations}
                onChange={(e) => setMinCitations(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Legend Callout */}
            <div className="pt-3 border-t border-card-border space-y-2 text-[11px]">
              <span className="font-bold text-text-subtle uppercase">Edge Relationship Legend</span>
              <div className="space-y-1.5 text-text-muted">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-danger" />
                  <span>Direct Legal Citation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 border-b-2 border-dashed border-primary-light" />
                  <span>Semantic Embedding Match</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 border-b-2 border-dotted border-success" />
                  <span>Same Applicant Portfolio</span>
                </div>
              </div>
            </div>
          </Card>

          {/* MAIN SVG GRAPH CANVAS */}
          <Card className="lg:col-span-3 p-4 border-primary/30 relative min-h-[500px] flex items-center justify-center overflow-hidden">
            <div
              className="w-full h-[520px] bg-[#0B1120] rounded-2xl border border-card-border relative overflow-hidden flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
            >
              <svg className="w-full h-full">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
                  </marker>
                </defs>

                {/* Draw Relationship Edge Lines */}
                {graphData.edges.map((edge, idx) => {
                  const sourceNode = graphData.nodes.find((n) => n.id === edge.source);
                  const targetNode = graphData.nodes.find((n) => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;

                  const totalNodes = graphData.nodes.length || 1;
                  const sIdx = graphData.nodes.findIndex((n) => n.id === edge.source);
                  const tIdx = graphData.nodes.findIndex((n) => n.id === edge.target);

                  const sAngle = (sIdx / totalNodes) * (2 * Math.PI);
                  const tAngle = (tIdx / totalNodes) * (2 * Math.PI);

                  const cx = 380;
                  const cy = 250;

                  const x1 = sourceNode.isCenter ? cx : cx + Math.cos(sAngle) * 220;
                  const y1 = sourceNode.isCenter ? cy : cy + Math.sin(sAngle) * 170;

                  const x2 = targetNode.isCenter ? cx : cx + Math.cos(tAngle) * 220;
                  const y2 = targetNode.isCenter ? cy : cy + Math.sin(tAngle) * 170;

                  const isHighlighted = selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);

                  return (
                    <line
                      key={edge.id || idx}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={edge.color}
                      strokeWidth={isHighlighted ? edge.thickness * 1.8 : edge.thickness}
                      strokeDasharray={edge.style === 'dashed' ? '5 3' : edge.style === 'dotted' ? '2 2' : 'none'}
                      opacity={selectedNode ? (isHighlighted ? 1 : 0.15) : 0.7}
                      markerEnd={edge.style === 'solid' ? 'url(#arrow)' : undefined}
                    />
                  );
                })}

                {/* Draw Patent Graph Nodes */}
                {graphData.nodes.map((node, idx) => {
                  const totalNodes = graphData.nodes.length || 1;
                  const angle = (idx / totalNodes) * (2 * Math.PI);
                  const cx = 380;
                  const cy = 250;

                  const x = node.isCenter ? cx : cx + Math.cos(angle) * 220;
                  const y = node.isCenter ? cy : cy + Math.sin(angle) * 170;

                  const isSelected = selectedNode?.id === node.id;
                  const isSearched = highlightedNodeId === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${x}, ${y})`}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse Ring for Center Node / Selected Node */}
                      {(node.isCenter || isSelected || isSearched) && (
                        <circle
                          r={node.radius + 10}
                          fill={node.color}
                          opacity="0.25"
                          className="animate-ping"
                        />
                      )}

                      <circle
                        r={node.radius}
                        fill="#0F172A"
                        stroke={isSelected || isSearched ? '#FFFFFF' : node.color}
                        strokeWidth={isSelected || isSearched ? 3.5 : 2}
                      />

                      <text
                        textAnchor="middle"
                        dy="3"
                        fill="#E2E8F0"
                        fontSize={node.isCenter ? '10' : '9'}
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {node.isCenter ? 'User Invention' : node.patentId.slice(0, 15)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </Card>

        </div>
      )}

      {/* TAB 2: TECHNOLOGY CLUSTERS */}
      {activeTab === 'clusters' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TECHNOLOGY_CLUSTERS.map((clust) => {
              const clusterNodes = graphData.nodes.filter((n) => n.clusterId === clust.id);

              return (
                <Card key={clust.id} className="p-6 space-y-4 border-card-border hover:border-primary/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: clust.color }} />
                      <h3 className="text-sm font-bold text-text-main">{clust.name}</h3>
                    </div>
                    <Badge variant="primary" size="sm">{clusterNodes.length} Patents</Badge>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed">
                    {clust.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-card-border/60">
                    <span className="text-[10px] font-bold text-text-subtle uppercase">Cluster Key Patents</span>
                    {clusterNodes.slice(0, 3).map((n) => (
                      <div key={n.id} className="p-2 rounded-lg bg-[#0F172A] text-xs flex justify-between">
                        <span className="font-mono text-primary-light truncate">{n.patentId}</span>
                        <span className="font-mono text-success">{n.pageRankScore}% Score</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TIMELINE ANALYSIS */}
      {activeTab === 'timeline' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <div>
              <h3 className="text-base font-bold text-text-main">Technology Evolution Timeline</h3>
              <p className="text-xs text-text-muted">Chronological progression of key patent milestones and citation links (2018 - 2026).</p>
            </div>
          </div>

          <div className="space-y-6 relative pl-6 border-l-2 border-primary/30">
            {Object.entries(timelineData).map(([yr, items]) => (
              <div key={yr} className="space-y-3 relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-[#0B1120]" />
                <span className="font-mono text-sm font-extrabold text-primary-light">{yr}</span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((it, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm">{it.patentId}</Badge>
                        <h4 className="text-xs font-bold text-text-main truncate">{it.title}</h4>
                      </div>
                      <p className="text-xs text-text-muted italic pt-1">
                        Milestone: {it.milestone}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: APPLICANT & INVENTOR NETWORKS */}
      {activeTab === 'networks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-text-main">Top Assignee Applicants</h3>
            <div className="space-y-3">
              {applicantsList.map((app, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-text-main">{app.name}</div>
                    <div className="text-[11px] text-text-subtle">{app.domainsList}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-primary-light font-bold">{app.patentCount} Patents</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-text-main">Inventor Collaboration Network</h3>
            <div className="space-y-3">
              {inventorsList.map((inv, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-text-main">{inv.name}</div>
                    <div className="text-[11px] text-text-subtle">Assignee: {inv.applicant}</div>
                  </div>
                  <Badge variant="outline" size="sm">{inv.domain}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: INFLUENTIAL PATENTS (PAGERANK) */}
      {activeTab === 'influential' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <div>
              <h3 className="text-base font-bold text-text-main">Influential Patents (PageRank Ranks)</h3>
              <p className="text-xs text-text-muted">High network influence identified within the analyzed dataset.</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0F172A] border-b border-card-border text-text-subtle font-bold uppercase">
                <th className="py-3 px-4">Patent ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Citation Count</th>
                <th className="py-3 px-4">PageRank Influence</th>
                <th className="py-3 px-4">Domain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/40 font-mono">
              {(metrics.influentialPatents || []).map((pat) => (
                <tr key={pat.id} className="hover:bg-card/40">
                  <td className="py-3 px-4 font-bold text-primary-light">{pat.patentId}</td>
                  <td className="py-3 px-4 font-sans font-bold text-text-main">{pat.title}</td>
                  <td className="py-3 px-4 text-text-muted">{pat.citationCount} Citations</td>
                  <td className="py-3 px-4 text-success font-bold">{pat.pageRankScore}% Score</td>
                  <td className="py-3 px-4 font-sans text-text-subtle">{pat.technologyDomain}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* TAB 6: NETWORK ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-2">
            <span className="text-xs font-semibold text-text-subtle">Total Analyzed Nodes</span>
            <div className="text-3xl font-extrabold text-primary-light font-mono">{metrics.totalPatents}</div>
          </Card>

          <Card className="p-6 space-y-2">
            <span className="text-xs font-semibold text-text-subtle">Total Relationship Edges</span>
            <div className="text-3xl font-extrabold text-secondary font-mono">{metrics.totalRelationships}</div>
          </Card>

          <Card className="p-6 space-y-2">
            <span className="text-xs font-semibold text-text-subtle">Direct Citation Links</span>
            <div className="text-3xl font-extrabold text-danger font-mono">{metrics.citationLinks}</div>
          </Card>

          <Card className="p-6 space-y-2">
            <span className="text-xs font-semibold text-text-subtle">Average Connectivity</span>
            <div className="text-3xl font-extrabold text-success font-mono">{metrics.avgConnectivity}</div>
          </Card>
        </div>
      )}

      {/* PATENT DETAIL DRAWER MODAL */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <Card className="p-6 max-w-xl w-full space-y-4 border-primary/50">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <div>
                  <Badge variant="primary" size="sm">{selectedNode.patentId}</Badge>
                  <h3 className="text-base font-bold text-text-main mt-1">{selectedNode.title}</h3>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-text-subtle hover:text-text-main">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-text-subtle">Technology Domain:</span>
                  <p className="text-text-main font-semibold">{selectedNode.technologyDomain}</p>
                </div>

                <div>
                  <span className="font-bold text-text-subtle">Assignee & Inventor:</span>
                  <p className="text-text-muted">{selectedNode.applicant} • {selectedNode.inventor}</p>
                </div>

                <div>
                  <span className="font-bold text-text-subtle">PageRank Network Score:</span>
                  <p className="text-success font-mono font-bold text-base">{selectedNode.pageRankScore}% Influence Rating</p>
                </div>

                {selectedNode.abstract && (
                  <div>
                    <span className="font-bold text-text-subtle">Abstract Snippet:</span>
                    <p className="text-text-muted p-2.5 rounded-xl bg-[#0F172A] border border-card-border line-clamp-3">
                      {selectedNode.abstract}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-card-border">
                <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={GitCompare}
                  onClick={() => navigate('/dashboard/compare', { state: { selectedPatents: [selectedNode] } })}
                >
                  Open in Comparison Matrix
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PatentRelationshipView;
