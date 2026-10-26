import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, X, PlusCircle, MinusCircle } from 'lucide-react';
import { calculateTextDiff } from '../../services/collaborationService';
import Button from '../ui/Button';

export const DifferenceViewerModal = ({ isOpen, onClose, versionA, versionB }) => {
  if (!isOpen) return null;

  const textA = versionA?.text || 'A quantum micro-fluidic neural processor comprising semiconductor channel arrays configured to execute parallel tensor operations with external cooling loops.';
  const textB = versionB?.text || 'A quantum micro-fluidic neural processor comprising monolithic gate-oxide semiconductor channel arrays configured to execute parallel tensor operations with direct dielectric laminar flow coolant channels (flow velocity 0.4m/s to 1.2m/s).';

  const diffTokens = calculateTextDiff(textA, textB);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl glass-card p-6 rounded-2xl border border-card-border shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-card-border pb-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary-light" />
            <h3 className="text-base font-bold text-text-main">Patent Version Difference Viewer (Diff)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-text-subtle hover:text-text-main">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1 text-success">
            <PlusCircle className="w-3.5 h-3.5" /> Added Text (+ Green)
          </span>
          <span className="flex items-center gap-1 text-danger">
            <MinusCircle className="w-3.5 h-3.5" /> Removed Text (- Red)
          </span>
        </div>

        {/* Highlighted Diff Canvas */}
        <div className="p-5 rounded-2xl bg-[#0B1120] border border-card-border font-mono text-xs leading-relaxed space-y-3">
          <div className="text-[10px] text-text-subtle uppercase border-b border-card-border/60 pb-2">
            Comparing: <strong className="text-text-main">{versionA?.name || 'Version 1.0 (Original)'}</strong> vs <strong className="text-primary-light">{versionB?.name || 'Version 2.0 (Updated Draft)'}</strong>
          </div>

          <div className="flex flex-wrap gap-1">
            {diffTokens.map((token, idx) => {
              if (token.type === 'added') {
                return (
                  <span key={idx} className="bg-success/20 text-success border border-success/40 px-1 rounded font-bold">
                    +{token.text}
                  </span>
                );
              }
              if (token.type === 'removed') {
                return (
                  <span key={idx} className="bg-danger/20 text-danger border border-danger/40 px-1 rounded line-through">
                    -{token.text}
                  </span>
                );
              }
              return <span key={idx} className="text-text-main">{token.text}</span>;
            })}
          </div>
        </div>

        <Button variant="primary" size="md" onClick={onClose} className="w-full">
          Close Difference Viewer
        </Button>
      </motion.div>
    </div>
  );
};

export default DifferenceViewerModal;
