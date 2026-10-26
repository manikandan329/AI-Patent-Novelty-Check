import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Mail, Check, ShieldCheck, X, Clock } from 'lucide-react';
import { generateShareableReportLink } from '../../services/reportManagementService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

export const ShareReportModal = ({ report, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

  if (!report) return null;

  const shareLink = generateShareableReportLink(report.reportId || report.submissionId);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Shareable link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!recipientEmail) {
      toast.error('Please enter a recipient email.');
      return;
    }
    toast.success(`Report link sent to ${recipientEmail}`);
    setRecipientEmail('');
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
            <Share2 className="w-5 h-5 text-primary-light" />
            <h3 className="text-base font-bold text-text-main">Share Patent Audit Report</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-text-subtle hover:text-text-main">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-bold text-text-main">{report.title}</h4>
          <p className="text-xs text-text-subtle font-mono">{report.submissionId} • Novelty Score: {report.noveltyScore}%</p>
        </div>

        {/* Copy Link Section */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
            Secure Shareable Audit URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-1 bg-[#0F172A] border border-card-border rounded-xl p-2.5 text-xs font-mono text-text-muted select-all focus:outline-none"
            />
            <Button variant="primary" size="md" icon={copied ? Check : Copy} onClick={handleCopyLink}>
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-text-subtle">
            <Clock className="w-3.5 h-3.5 text-warning" />
            <span>Link expires automatically in 7 days for IP security.</span>
          </div>
        </div>

        {/* Email Share Section */}
        <form onSubmit={handleSendEmail} className="space-y-3 pt-2 border-t border-card-border/60">
          <Input
            label="Email Report to Stakeholder"
            type="email"
            placeholder="attorney@firm.com"
            icon={Mail}
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
          <Button type="submit" variant="secondary" size="md" className="w-full">
            Dispatch Secured Email Link
          </Button>
        </form>

        <Button variant="ghost" size="sm" onClick={onClose} className="w-full">
          Close Share Dialog
        </Button>
      </motion.div>
    </div>
  );
};

export default ShareReportModal;
