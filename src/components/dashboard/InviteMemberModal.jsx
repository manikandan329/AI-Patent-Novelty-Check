import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Shield, X, Send } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';

export const InviteMemberModal = ({ isOpen, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Reviewer');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please provide a valid email address.');
      return;
    }

    onInvite(email, role, name);
    setEmail('');
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md glass-card p-6 rounded-2xl border border-card-border shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-card-border pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary-light" />
            <h3 className="text-base font-bold text-text-main">Invite Team Collaborator</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-text-subtle hover:text-text-main">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label="Collaborator Name (Optional)"
            placeholder="Dr. Alexander Vance"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="attorney@firm.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <label className="block text-[10px] font-bold text-text-subtle uppercase mb-1">Assign Role Permissions</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#0F172A] border border-card-border rounded-xl p-2.5 text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Reviewer">Reviewer (Can Comment & Approve/Reject)</option>
              <option value="Editor">Editor (Can Edit Content & Manage Drafts)</option>
              <option value="Viewer">Viewer (Read-Only Access)</option>
              <option value="Owner">Owner (Full Permissions & Team Control)</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" size="md" onClick={onClose} className="w-1/2">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" icon={Send} className="w-1/2 shadow-glow-primary">
              Send Invite
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default InviteMemberModal;
