import React from 'react';
import { Edit3, CheckCircle2, FileText, User, Tag, Lock, ShieldCheck } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export const Step5ReviewSubmit = ({ formData, onEditSection }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-card-border/60 pb-3">
        <h2 className="text-lg font-bold text-text-main">Step 5: Review & Confirm Submission</h2>
        <p className="text-xs text-text-muted">
          Inspect all details prior to storing document in Firestore `patent_submissions` collection.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Section 1: Basic Information */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary-light flex items-center gap-2">
              <Tag className="w-4 h-4" /> 1. Basic Invention Information
            </h3>
            <button
              type="button"
              onClick={() => onEditSection(1)}
              className="text-xs font-semibold text-primary-light hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Section
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-text-subtle uppercase text-[10px]">Patent Title</span>
              <p className="font-bold text-text-main text-sm">{formData.title || 'N/A'}</p>
            </div>

            <div>
              <span className="text-text-subtle uppercase text-[10px]">Category & Domain</span>
              <p className="font-semibold text-text-main">{formData.category || 'N/A'}</p>
              <p className="text-text-subtle font-mono">{formData.technologyDomain}</p>
            </div>

            <div className="md:col-span-2">
              <span className="text-text-subtle uppercase text-[10px]">Keyword Tags</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(formData.keywords || []).map((k) => (
                  <Badge key={k} variant="primary" size="sm">#{k}</Badge>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <span className="text-text-subtle uppercase text-[10px]">Abstract / Short Summary</span>
              <p className="text-text-muted bg-[#0F172A] p-3 rounded-xl border border-card-border leading-relaxed mt-1">
                {formData.summary || 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        {/* Section 2: Patent Details */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-light flex items-center gap-2">
              <FileText className="w-4 h-4" /> 2. Technical Patent Details
            </h3>
            <button
              type="button"
              onClick={() => onEditSection(2)}
              className="text-xs font-semibold text-primary-light hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Section
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border">
              <span className="text-[10px] text-text-subtle uppercase">Problem Statement</span>
              <p className="text-text-main font-medium mt-0.5">{formData.problemStatement || 'N/A'}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border">
              <span className="text-[10px] text-text-subtle uppercase">Proposed Solution</span>
              <p className="text-text-main font-medium mt-0.5">{formData.proposedSolution || 'N/A'}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border">
              <span className="text-[10px] text-text-subtle uppercase">Novel Features</span>
              <p className="text-text-main font-medium mt-0.5">{formData.novelFeatures || 'N/A'}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border">
              <span className="text-[10px] text-text-subtle uppercase">Working Principle</span>
              <p className="text-text-main font-medium mt-0.5">{formData.workingPrinciple || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Section 3 & 4 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Uploaded Files */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between border-b border-card-border/60 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-success flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> 3. Attached Documents ({(formData.uploadedFiles || []).length})
              </h3>
              <button
                type="button"
                onClick={() => onEditSection(3)}
                className="text-xs font-semibold text-primary-light hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {(formData.uploadedFiles || []).length > 0 ? (
                formData.uploadedFiles.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#0F172A] border border-card-border flex items-center justify-between">
                    <span className="font-bold text-text-main truncate max-w-[180px]">{f.name}</span>
                    <span className="text-[10px] text-text-subtle font-mono">{f.size}</span>
                  </div>
                ))
              ) : (
                <p className="text-text-subtle italic">No documents attached.</p>
              )}
            </div>
          </Card>

          {/* Inventor Info */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between border-b border-card-border/60 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-warning flex items-center gap-2">
                <User className="w-4 h-4" /> 4. Inventor Information
              </h3>
              <button
                type="button"
                onClick={() => onEditSection(4)}
                className="text-xs font-semibold text-primary-light hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <p><strong className="text-text-main">Inventor:</strong> {formData.inventorName || 'N/A'}</p>
              <p><strong className="text-text-main">Organization:</strong> {formData.organization || 'N/A'}</p>
              <p><strong className="text-text-main">Location:</strong> {[formData.city, formData.state, formData.country].filter(Boolean).join(', ') || 'N/A'}</p>
              <div className="pt-1">
                <Badge variant="secondary" size="sm">Visibility: {formData.visibility || 'Private'}</Badge>
              </div>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default Step5ReviewSubmit;
