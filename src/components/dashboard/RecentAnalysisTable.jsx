import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Eye, FileText, X } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export const RecentAnalysisTable = ({ data = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);

  const itemsPerPage = 4;

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filtered & Sorted items
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.patentNumber.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, searchTerm, sortField, sortOrder]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(start, start + itemsPerPage);
  }, [filteredAndSortedData, currentPage]);

  return (
    <>
      <Card className="p-6 space-y-4">
        
        {/* Table Top Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Recent Patent Analyses</CardTitle>
            <CardDescription>Audited patent novelty scans and claim evaluations</CardDescription>
          </div>

          {/* Search Table Filter */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter table rows..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0F172A] border border-card-border/80 rounded-xl py-1.5 pl-9 pr-3 text-xs text-text-main placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Responsive Table Canvas */}
        <div className="overflow-x-auto rounded-xl border border-card-border/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0F172A]/90 text-[11px] font-bold text-text-subtle uppercase tracking-wider border-b border-card-border/60">
                <th
                  onClick={() => handleSort('title')}
                  className="py-3 px-4 cursor-pointer hover:text-text-main transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Patent Title <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-text-main transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Date <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('noveltyScore')}
                  className="py-3 px-4 cursor-pointer hover:text-text-main transition-colors"
                >
                  <div className="flex items-center gap-1">
                    Novelty Score <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-card-border/40 text-xs">
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <tr key={row.id} className="hover:bg-card/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-text-main max-w-xs truncate">{row.title}</div>
                      <div className="text-[10px] text-text-subtle font-mono">{row.patentNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-text-muted font-mono">{row.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono font-extrabold text-sm ${
                          row.noveltyScore >= 90
                            ? 'text-success'
                            : row.noveltyScore >= 80
                            ? 'text-warning'
                            : 'text-danger'
                        }`}
                      >
                        {row.noveltyScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          row.status === 'Completed'
                            ? 'success'
                            : row.status === 'Under Review'
                            ? 'warning'
                            : 'outline'
                        }
                        size="sm"
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedReport(row)}
                      >
                        View Report
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-subtle">
                    No analyses match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="flex items-center justify-between pt-2 text-xs text-text-subtle">
          <span>
            Page {currentPage} of {totalPages} ({filteredAndSortedData.length} records)
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-card border border-card-border text-text-muted hover:text-text-main disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-card border border-card-border text-text-muted hover:text-text-main disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </Card>

      {/* View Report Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-card p-6 rounded-2xl border border-primary/30 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-light" />
                  <h3 className="text-base font-bold text-text-main">Patent Novelty Report</h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1 rounded-lg text-text-subtle hover:text-text-main"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-text-subtle uppercase text-[10px]">Title</span>
                  <h4 className="text-sm font-bold text-text-main">{selectedReport.title}</h4>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0F172A] border border-card-border">
                  <div>
                    <span className="text-[10px] text-text-subtle uppercase">Patent Filing ID</span>
                    <p className="font-mono font-bold text-primary-light">{selectedReport.patentNumber}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-subtle uppercase">Calculated Novelty</span>
                    <p className="font-mono font-bold text-success text-base">{selectedReport.noveltyScore}%</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
                  <span className="text-[10px] text-text-subtle uppercase">Claim Analysis Breakdown</span>
                  <p className="text-text-muted">
                    Evaluated against USPTO vector prior art. <strong>{selectedReport.priorArtMatches} overlapping patents</strong> detected.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => setSelectedReport(null)}
              >
                Close Report Preview
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RecentAnalysisTable;
