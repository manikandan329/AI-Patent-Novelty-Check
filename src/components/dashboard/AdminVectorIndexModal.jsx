import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, RefreshCw, Upload, Trash2, Shield, CheckCircle2, X } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import toast from 'react-hot-toast';

export const AdminVectorIndexModal = ({ onClose }) => {
  const [rebuilding, setRebuilding] = useState(false);
  const [stats, setStats] = useState({
    indexedPatents: 142850900,
    dimension: 384,
    indexType: 'FAISS IndexFlatIP',
    memoryUsage: '42.8 GB',
  });

  const handleRebuildIndex = () => {
    setRebuilding(true);
    setTimeout(() => {
      setRebuilding(false);
      setStats((prev) => ({ ...prev, indexedPatents: prev.indexedPatents + 1000 }));
      toast.success('FAISS Vector Index rebuilt successfully with 142.8M vectors!');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg glass-card p-6 rounded-2xl border border-card-border shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between border-b border-card-border pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary-light" />
            <h3 className="text-base font-bold text-text-main">FAISS Vector Index Management</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-subtle hover:text-text-main"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Index Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] text-text-subtle uppercase">Indexed Patents</span>
            <p className="font-mono font-bold text-text-main text-base">
              {stats.indexedPatents.toLocaleString()}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] text-text-subtle uppercase">Embedding Dimensions</span>
            <p className="font-mono font-bold text-primary-light text-base">{stats.dimension}-D</p>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] text-text-subtle uppercase">FAISS Index Type</span>
            <p className="font-semibold text-text-main">{stats.indexType}</p>
          </div>

          <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] text-text-subtle uppercase">RAM Memory Allocation</span>
            <p className="font-mono font-bold text-success text-base">{stats.memoryUsage}</p>
          </div>
        </div>

        {/* Admin Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            variant="primary"
            size="md"
            icon={RefreshCw}
            loading={rebuilding}
            onClick={handleRebuildIndex}
            className="w-full justify-center shadow-glow-primary"
          >
            Rebuild FAISS Vector Index
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Upload}
              onClick={() => toast.success('Dataset Upload Portal Ready')}
              className="w-1/2 justify-center"
            >
              Upload Dataset
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Trash2}
              onClick={() => toast('Index cache purged', { icon: '🧹' })}
              className="w-1/2 justify-center text-danger hover:bg-danger/10"
            >
              Purge Cache
            </Button>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={onClose} className="w-full">
          Close Admin Tools
        </Button>
      </motion.div>
    </div>
  );
};

export default AdminVectorIndexModal;
