import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Clock, FileText, ArrowRight, LayoutDashboard, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

export const SubmissionSuccessModal = ({ submissionData, onClose }) => {
  const navigate = useNavigate();

  if (!submissionData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-lg glass-card p-8 rounded-3xl border border-success/40 shadow-2xl text-center space-y-6 relative overflow-hidden"
      >
        {/* Top Glow & Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-success/15 border border-success/40 text-success flex items-center justify-center mx-auto shadow-lg shadow-success/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-text-main tracking-tight">
            Patent Submission Successful!
          </h2>
          <p className="text-xs text-text-muted">
            Your invention document has been securely encrypted and stored in Firestore collection <code className="font-mono text-primary-light">patent_submissions</code>.
          </p>
        </div>

        {/* Details Card */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-card-border text-left space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-card-border/60 pb-2">
            <span className="text-text-subtle uppercase text-[10px]">Unique Submission ID</span>
            <span className="font-mono font-bold text-primary-light text-sm">{submissionData.submissionId}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-subtle">Patent Title</span>
            <span className="font-bold text-text-main truncate max-w-[200px]">{submissionData.title}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-subtle">Submission Date</span>
            <span className="font-mono text-text-muted">{new Date(submissionData.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-card-border/60">
            <span className="text-text-subtle flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-warning" /> Estimated AI Scan Time
            </span>
            <span className="font-bold text-warning">&lt; 30 Seconds</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={LayoutDashboard}
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-1/2 justify-center"
          >
            Return to Dashboard
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Sparkles}
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-1/2 justify-center shadow-glow-primary"
          >
            Proceed to AI Analysis
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SubmissionSuccessModal;
