import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Plus, Upload, Search, Edit2, Trash2, Globe, FileText, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import {
  getKnowledgeBasePatents,
  savePatentRecord,
  deletePatentRecord,
  processBulkPatentImport,
} from '../../services/adminManagementService';
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export const KnowledgeBaseView = () => {
  const [patents, setPatents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');

  // Modals
  const [editPatent, setEditPatent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [previewRecords, setPreviewRecords] = useState([]);

  useEffect(() => {
    loadPatents();
  }, [searchTerm, selectedDomain, selectedCountry]);

  const loadPatents = async () => {
    const data = await getKnowledgeBasePatents({
      search: searchTerm,
      domain: selectedDomain,
      country: selectedCountry,
    });
    setPatents(data);
  };

  const handleOpenAdd = () => {
    setEditPatent({
      patentId: `US-2026-${Math.floor(1000000 + Math.random() * 9000000)}-A1`,
      title: '',
      abstract: '',
      claims: '1. A novel processor apparatus comprising...',
      technologyDomain: 'Quantum Electronics',
      inventor: '',
      publicationDate: new Date().toISOString().split('T')[0],
      country: 'United States',
      keywords: 'quantum, micro-fluidic, neural',
    });
    setIsEditModalOpen(true);
  };

  const handleSavePatent = async (e) => {
    e.preventDefault();
    if (!editPatent.title || !editPatent.patentId) {
      toast.error('Patent ID and Title are required.');
      return;
    }

    const keywordsArray = typeof editPatent.keywords === 'string'
      ? editPatent.keywords.split(',').map((k) => k.trim())
      : editPatent.keywords;

    const payload = { ...editPatent, keywords: keywordsArray };
    const updated = await savePatentRecord(payload);
    setPatents(updated);
    setIsEditModalOpen(false);
    toast.success('Patent record saved to Knowledge Base!');
  };

  const handleDelete = async (patentId) => {
    if (window.confirm(`Delete patent record ${patentId} from Knowledge Base?`)) {
      const updated = await deletePatentRecord(patentId);
      setPatents(updated);
      toast.success('Patent record removed');
    }
  };

  // Bulk JSON/CSV parser preview
  const handleBulkPreview = () => {
    try {
      let parsed = [];
      if (bulkInputText.trim().startsWith('[')) {
        parsed = JSON.parse(bulkInputText);
      } else {
        // Parse CSV lines
        const lines = bulkInputText.trim().split('\n');
        parsed = lines.slice(1).map((line) => {
          const parts = line.split(',');
          return {
            patentId: parts[0]?.trim(),
            title: parts[1]?.trim(),
            technologyDomain: parts[2]?.trim(),
            country: parts[3]?.trim(),
          };
        });
      }
      setPreviewRecords(parsed.filter((p) => p.title || p.patentId));
      toast.success(`Parsed ${parsed.length} records for preview.`);
    } catch (err) {
      toast.error('Invalid JSON/CSV format: ' + err.message);
    }
  };

  const handleCommitBulkImport = async () => {
    if (previewRecords.length === 0) return;
    const res = await processBulkPatentImport(previewRecords);
    toast.success(`Imported ${res.importedCount} new patents! (${res.duplicateCount} duplicates skipped)`);
    setIsBulkModalOpen(false);
    setBulkInputText('');
    setPreviewRecords([]);
    loadPatents();
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      
      {/* Header & Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-card-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-text-main">Patent Knowledge Base</h1>
            <Badge variant="primary" size="sm">{patents.length} Corpus Records</Badge>
          </div>
          <p className="text-xs text-text-muted">
            Manage, add, edit, and bulk import patent dataset records used by Module 4 vector search.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Upload} onClick={() => setIsBulkModalOpen(true)}>
            Bulk CSV/JSON Import
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd} className="shadow-glow-primary">
            Add Patent Record
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          <div className="relative">
            <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, title, or inventor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0F172A] border border-card-border rounded-xl py-2 pl-9 pr-3 text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full bg-[#0F172A] border border-card-border rounded-xl p-2 text-text-main focus:outline-none"
            >
              <option value="All">All Domains</option>
              <option value="Quantum Electronics">Quantum Electronics</option>
              <option value="Biotechnology">Biotechnology</option>
              <option value="Autonomous Robotics">Autonomous Robotics</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Materials Science">Materials Science</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-[#0F172A] border border-card-border rounded-xl p-2 text-text-main focus:outline-none"
            >
              <option value="All">All Countries / Offices</option>
              <option value="United States">United States (USPTO)</option>
              <option value="European Patent Office">European Patent Office (EPO)</option>
              <option value="WIPO">WIPO International</option>
              <option value="Japan">Japan (JPO)</option>
            </select>
          </div>

        </div>
      </Card>

      {/* Main Knowledge Base Table */}
      <Card className="p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0F172A] font-bold text-text-subtle uppercase border-b border-card-border">
              <th className="py-3.5 px-4">Patent ID</th>
              <th className="py-3.5 px-4">Title & Abstract</th>
              <th className="py-3.5 px-4">Domain</th>
              <th className="py-3.5 px-4">Inventor & Date</th>
              <th className="py-3.5 px-4">Country</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border/40">
            {patents.map((p) => (
              <tr key={p.patentId} className="hover:bg-card/60 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-primary-light">{p.patentId}</td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-text-main max-w-sm leading-snug">{p.title}</div>
                  <div className="text-[10px] text-text-subtle truncate max-w-xs">{p.abstract}</div>
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant="outline" size="sm">{p.technologyDomain}</Badge>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-text-muted">{p.inventor}</div>
                  <div className="text-[10px] text-text-subtle font-mono">{p.publicationDate}</div>
                </td>
                <td className="py-3.5 px-4 text-text-subtle">{p.country}</td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setEditPatent({ ...p, keywords: Array.isArray(p.keywords) ? p.keywords.join(', ') : p.keywords });
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-text-subtle hover:text-text-main hover:bg-card"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.patentId)}
                      className="p-1.5 rounded-lg text-text-subtle hover:text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Add / Edit Patent Modal */}
      <AnimatePresence>
        {isEditModalOpen && editPatent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl glass-card p-6 rounded-2xl border border-card-border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <h3 className="text-base font-bold text-text-main">
                  {editPatent.title ? 'Edit Patent Record' : 'Add New Patent Record'}
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-text-subtle hover:text-text-main">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePatent} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Patent ID"
                    value={editPatent.patentId}
                    onChange={(e) => setEditPatent({ ...editPatent, patentId: e.target.value })}
                    required
                  />
                  <Input
                    label="Publication Date"
                    type="date"
                    value={editPatent.publicationDate}
                    onChange={(e) => setEditPatent({ ...editPatent, publicationDate: e.target.value })}
                  />
                </div>

                <Input
                  label="Patent Title"
                  value={editPatent.title}
                  onChange={(e) => setEditPatent({ ...editPatent, title: e.target.value })}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-text-subtle uppercase mb-1">Domain</label>
                    <select
                      value={editPatent.technologyDomain}
                      onChange={(e) => setEditPatent({ ...editPatent, technologyDomain: e.target.value })}
                      className="w-full bg-[#0F172A] border border-card-border rounded-xl p-2 text-text-main"
                    >
                      <option value="Quantum Electronics">Quantum Electronics</option>
                      <option value="Biotechnology">Biotechnology</option>
                      <option value="Autonomous Robotics">Autonomous Robotics</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Materials Science">Materials Science</option>
                    </select>
                  </div>

                  <Input
                    label="Inventor Name"
                    value={editPatent.inventor}
                    onChange={(e) => setEditPatent({ ...editPatent, inventor: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-subtle uppercase mb-1">Abstract</label>
                  <textarea
                    rows={3}
                    value={editPatent.abstract}
                    onChange={(e) => setEditPatent({ ...editPatent, abstract: e.target.value })}
                    className="w-full bg-[#0F172A] border border-card-border rounded-xl p-2.5 text-text-main text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-text-subtle uppercase mb-1">Keywords (Comma Separated)</label>
                  <Input
                    value={editPatent.keywords}
                    onChange={(e) => setEditPatent({ ...editPatent, keywords: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="ghost" size="md" onClick={() => setIsEditModalOpen(false)} className="w-1/2">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md" className="w-1/2">
                    Save Record
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl glass-card p-6 rounded-2xl border border-card-border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary-light" /> Bulk Patent Dataset Import
                </h3>
                <button onClick={() => setIsBulkModalOpen(false)} className="p-1 text-text-subtle hover:text-text-main">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-text-muted">
                  Paste JSON Array or CSV formatted patent filings below to preview before importing:
                </p>

                <textarea
                  rows={6}
                  placeholder={`[\n  { "patentId": "US-2026-0991", "title": "Sub-GHz UWB Mesh Router", "technologyDomain": "Autonomous Robotics" }\n]`}
                  value={bulkInputText}
                  onChange={(e) => setBulkInputText(e.target.value)}
                  className="w-full bg-[#0F172A] border border-card-border rounded-xl p-3 font-mono text-xs text-text-main focus:outline-none"
                />

                <Button variant="outline" size="sm" onClick={handleBulkPreview} className="w-full justify-center">
                  Preview & Validate Dataset
                </Button>

                {/* Preview Table */}
                {previewRecords.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-card-border">
                    <span className="font-bold text-text-main uppercase text-[10px]">
                      Validated Records Preview ({previewRecords.length})
                    </span>
                    <div className="max-h-40 overflow-y-auto border border-card-border rounded-xl p-2 bg-[#0F172A] space-y-1 font-mono text-[11px]">
                      {previewRecords.map((rec, idx) => (
                        <div key={idx} className="flex justify-between border-b border-card-border/40 pb-1">
                          <span className="text-primary-light">{rec.patentId || 'Auto-ID'}</span>
                          <span className="text-text-main truncate max-w-xs">{rec.title}</span>
                          <span className="text-text-subtle">{rec.technologyDomain}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="md" onClick={() => setIsBulkModalOpen(false)} className="w-1/2">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={previewRecords.length === 0}
                  onClick={handleCommitBulkImport}
                  className="w-1/2 shadow-glow-primary"
                >
                  Commit Import ({previewRecords.length})
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default KnowledgeBaseView;
