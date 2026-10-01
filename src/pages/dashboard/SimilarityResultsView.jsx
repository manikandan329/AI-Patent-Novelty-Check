import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Search, ArrowRight, LayoutDashboard, Sparkles, Database, FileText, Globe, Calendar, Eye, Layers, Network, TrendingUp } from 'lucide-react';
import { getSimilarityResults, PATENT_DATABASE_CORPUS } from '../../services/semanticSearchEngine';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AdminVectorIndexModal from '../../components/dashboard/AdminVectorIndexModal';

export const SimilarityResultsView = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [resultsData, setResultsData] = useState(null);
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    getSimilarityResults(submissionId || 'SUB-2026-DEMO').then((res) => {
      if (res) {
        setResultsData(res);
      } else {
        // Fallback demo results
        const mockRes = {
          submissionId: submissionId || 'SUB-2026-DEMO',
          title: 'Quantum Micro-Fluidic Neural Processing Unit',
          topSimilarPatents: PATENT_DATABASE_CORPUS.map((p, idx) => ({
            ...p,
            similarityScore: Math.round((96.4 - idx * 2.1) * 10) / 10,
          })).slice(0, 10),
          processingTime: '2.45s',
          embeddingId: 'emb_3910283',
        };
        setResultsData(mockRes);
      }
    });
  }, [submissionId]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      
      {/* Top Banner / Success Screen Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-success/40 shadow-glow-primary space-y-4 bg-hero-gradient">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-success/15 border border-success/40 text-success flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm">Search Completed Successfully</Badge>
                <span className="text-xs font-mono text-text-subtle">Time: {resultsData?.processingTime || '2.1s'}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-text-main">
                Top 10 Similar Patents Retrieved
              </h1>
              <p className="text-xs text-text-muted">
                FAISS Vector Search finished for <span className="font-bold text-text-main">{resultsData?.title}</span> ({submissionId})
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={() => navigate(`/dashboard/nlp-processing/${submissionId || 'SUB-2026-DEMO'}`)}
            >
              NLP & Doc Inspector (Module 4)
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Layers}
              onClick={() => navigate(`/dashboard/compare/${submissionId || 'SUB-2026-DEMO'}`, { state: { selectedPatents: resultsData?.topSimilarPatents } })}
            >
              Advanced Comparison (Module 13)
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Network}
              onClick={() => navigate(`/dashboard/relationships/${submissionId || 'SUB-2026-DEMO'}`)}
            >
              Citation Graph (Module 15)
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={TrendingUp}
              onClick={() => navigate(`/dashboard/intelligence/${submissionId || 'SUB-2026-DEMO'}`)}
            >
              Tech Intelligence (Module 16)
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Search}
              onClick={() => navigate('/dashboard/research')}
            >
              Patent Research (Module 14)
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => navigate(`/dashboard/analysis/${submissionId || 'SUB-2026-DEMO'}`)}
              className="shadow-glow-primary"
            >
              View Full Novelty Audit
            </Button>
          </div>
        </div>
      </div>

      {/* Main Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-main flex items-center gap-2">
            <Search className="w-5 h-5 text-primary-light" />
            Ranked Prior Art Similarities (Highest to Lowest)
          </h2>
          <span className="text-xs text-text-subtle font-mono">
            Corpus: 140M+ USPTO & WIPO Filings
          </span>
        </div>

        {/* Top 10 Patent Cards List */}
        <div className="space-y-3">
          {(resultsData?.topSimilarPatents || []).map((patent, rank) => {
            const score = patent.similarityScore;

            return (
              <motion.div
                key={patent.patentId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: rank * 0.05 }}
              >
                <Card className="p-5 border-card-border hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Rank Badge & Patent Information */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-card border border-card-border flex items-center justify-center font-mono font-extrabold text-xs text-primary-light shrink-0">
                      #{rank + 1}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary-light">
                          {patent.patentId}
                        </span>
                        <Badge variant="outline" size="sm">
                          {patent.technologyDomain}
                        </Badge>
                        <span className="text-[11px] text-text-subtle flex items-center gap-1">
                          <Globe className="w-3 h-3" /> {patent.country}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-text-main leading-snug">
                        {patent.title}
                      </h3>

                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        {patent.abstract}
                      </p>
                    </div>
                  </div>

                  {/* Similarity Score & Action */}
                  <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-card-border/60 pt-3 md:pt-0 md:pl-5">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-sans text-text-subtle">Similarity Score</span>
                      <p
                        className={`text-xl font-extrabold font-mono ${
                          score >= 90
                            ? 'text-success'
                            : score >= 80
                            ? 'text-warning'
                            : 'text-text-main'
                        }`}
                      >
                        {score}%
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedPatent(patent)}
                    >
                      View Details
                    </Button>
                  </div>

                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Patent Details Modal */}
      <AnimatePresence>
        {selectedPatent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl glass-card p-6 rounded-2xl border border-primary/30 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-light" />
                  <h3 className="text-base font-bold text-text-main">Prior Art Reference Details</h3>
                </div>
                <Badge variant="success" size="sm">{selectedPatent.similarityScore}% Match</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-text-subtle uppercase text-[10px]">Patent Title</span>
                  <h4 className="text-sm font-bold text-text-main">{selectedPatent.title}</h4>
                  <p className="font-mono text-primary-light font-bold mt-0.5">{selectedPatent.patentId}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0F172A] border border-card-border">
                  <div>
                    <span className="text-[10px] text-text-subtle uppercase">Domain</span>
                    <p className="font-bold text-text-main">{selectedPatent.technologyDomain}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-subtle uppercase">Publication Date</span>
                    <p className="font-mono text-text-muted">{selectedPatent.publicationDate}</p>
                  </div>
                </div>

                <div>
                  <span className="text-text-subtle uppercase text-[10px]">Abstract</span>
                  <p className="text-text-muted bg-[#0F172A] p-3 rounded-xl border border-card-border leading-relaxed mt-1">
                    {selectedPatent.abstract}
                  </p>
                </div>

                <div>
                  <span className="text-text-subtle uppercase text-[10px]">Independent Claim 1</span>
                  <p className="text-text-muted bg-[#0F172A] p-3 rounded-xl border border-card-border leading-relaxed mt-1 font-mono text-[11px]">
                    {selectedPatent.claims}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setSelectedPatent(null)}
              >
                Close Details
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Vector Index Modal */}
      {isAdminModalOpen && (
        <AdminVectorIndexModal onClose={() => setIsAdminModalOpen(false)} />
      )}

    </div>
  );
};

export default SimilarityResultsView;
