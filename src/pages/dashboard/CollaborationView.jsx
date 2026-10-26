import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  MessageSquare,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileText,
  Plus,
  Send,
  Eye,
  Trash2,
  Activity,
  Award,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  getTeamMembers,
  inviteTeamMember,
  removeTeamMember,
  getCommentThreads,
  addCommentThread,
  addReplyToComment,
  toggleResolveComment,
  getReviewRequests,
  submitReviewDecision,
  getCollabActivities,
} from '../../services/collaborationService';
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import InviteMemberModal from '../../components/dashboard/InviteMemberModal';
import CommentThreadDrawer from '../../components/dashboard/CommentThreadDrawer';
import DifferenceViewerModal from '../../components/dashboard/DifferenceViewerModal';
import toast from 'react-hot-toast';

export const CollaborationView = () => {
  const { currentUser } = useAuth();
  const submissionId = 'SUB-2026-98142';

  // State
  const [team, setTeam] = useState([]);
  const [comments, setComments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activities, setActivities] = useState([]);

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);

  useEffect(() => {
    getTeamMembers(submissionId).then(setTeam);
    getCommentThreads(submissionId).then(setComments);
    getReviewRequests(submissionId).then(setReviews);
    getCollabActivities(submissionId).then(setActivities);
  }, []);

  const handleInvite = async (email, role, name) => {
    const updated = await inviteTeamMember(submissionId, email, role, name);
    setTeam(updated);
    toast.success(`Invitation sent to ${email} as ${role}!`);
  };

  const handleRemove = async (memberId) => {
    if (window.confirm('Remove this collaborator from workspace?')) {
      const updated = await removeTeamMember(submissionId, memberId);
      setTeam(updated);
      toast.success('Collaborator removed');
    }
  };

  const handleAddComment = async (field, fieldLabel, text) => {
    const updated = await addCommentThread(submissionId, field, fieldLabel, currentUser?.displayName || 'Dr. Elena Rostova', 'Owner', text);
    setComments(updated);
  };

  const handleReplyComment = async (commentId, replyText) => {
    const updated = await addReplyToComment(submissionId, commentId, currentUser?.displayName || 'Dr. Elena Rostova', 'Owner', replyText);
    setComments(updated);
  };

  const handleToggleResolve = async (commentId) => {
    const updated = await toggleResolveComment(submissionId, commentId);
    setComments(updated);
  };

  const handleReviewDecision = async (reviewId, decision) => {
    const remarks = window.prompt(`Enter remarks for review decision (${decision}):`, 'Verified claim elements.');
    if (remarks !== null) {
      const updated = await submitReviewDecision(submissionId, reviewId, decision, remarks);
      setReviews(updated);
      toast.success(`Review decision updated to: ${decision}`);
    }
  };

  const activeReview = reviews[0] || { status: 'Approved', decision: 'Approved for Formal Filing', remarks: 'Patent claims verified.' };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      
      {/* 1. Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-primary/40 shadow-glow-primary space-y-6 bg-hero-gradient">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Real-Time Team Workspace</Badge>
              <span className="text-xs font-mono text-text-subtle">{submissionId}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
              Patent Collaboration & Review Workspace
            </h1>
            <p className="text-xs text-text-muted max-w-2xl">
              Collaborate with patent attorneys, professors, and team members in real time. Manage role permissions, review approvals, and field comment threads.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" icon={GitBranch} onClick={() => setIsDiffModalOpen(true)}>
              Compare Versions (Diff)
            </Button>
            <Button variant="primary" size="sm" icon={UserPlus} onClick={() => setIsInviteModalOpen(true)} className="shadow-glow-primary">
              Invite Collaborator
            </Button>
          </div>
        </div>

        {/* Top Workspace Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-card-border/60">
          <div className="p-3 rounded-2xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-subtle">Active Team Members</span>
            <p className="text-xl font-mono font-extrabold text-text-main">{team.length} Members</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-subtle">Review Approval Status</span>
            <p className="text-base font-extrabold text-success font-mono">{activeReview.status}</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-subtle">Field Comment Threads</span>
            <p className="text-xl font-mono font-extrabold text-primary-light">{comments.length} Threads</p>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F172A] border border-card-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-subtle">Active Patent Version</span>
            <p className="text-base font-extrabold text-text-main font-mono">v2.0 (Enhanced Draft)</p>
          </div>
        </div>
      </div>

      {/* 2. Team Roster & Review Approval Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Team Members Roster Card */}
        <div className="lg:col-span-7">
          <Card className="p-6 h-full flex flex-col justify-between space-y-4">
            <CardHeader className="mb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-light" />
                    Team Collaborators & Role RBAC
                  </CardTitle>
                  <CardDescription>Collaborator roles and workspace access permissions</CardDescription>
                </div>
                <Button variant="ghost" size="sm" icon={UserPlus} onClick={() => setIsInviteModalOpen(true)}>
                  Invite
                </Button>
              </div>
            </CardHeader>

            <div className="space-y-3 pt-2 text-xs">
              {team.map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                      style={{ background: m.avatarColor }}
                    >
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-text-main">{m.name}</div>
                      <div className="text-[10px] text-text-subtle font-mono">{m.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={m.role === 'Owner' ? 'primary' : m.role === 'Reviewer' ? 'secondary' : 'outline'} size="sm">
                      {m.role}
                    </Badge>
                    <Badge variant={m.status === 'Accepted' ? 'success' : 'warning'} size="sm">
                      {m.status}
                    </Badge>
                    {m.role !== 'Owner' && (
                      <button
                        onClick={() => handleRemove(m.id)}
                        className="p-1 text-text-subtle hover:text-danger"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Review Approval Workflow Card */}
        <div className="lg:col-span-5">
          <Card className="p-6 h-full flex flex-col justify-between space-y-4">
            <CardHeader className="mb-0">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-success" />
                Patent Review & Approval Workflow
              </CardTitle>
              <CardDescription>Formal reviewer sign-off before USPTO/EPO submission</CardDescription>
            </CardHeader>

            <div className="space-y-3 text-xs pt-2">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-card-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-text-subtle">Reviewer Sign-off</span>
                  <Badge variant={activeReview.status === 'Approved' ? 'success' : 'warning'} size="sm">
                    {activeReview.status}
                  </Badge>
                </div>

                <p className="font-bold text-text-main">{activeReview.reviewerName}</p>
                <p className="text-text-muted leading-relaxed text-[11px] bg-card p-2.5 rounded-lg border border-card-border">
                  "{activeReview.remarks}"
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold text-text-subtle">Submit Review Decision:</span>
                <div className="flex gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleReviewDecision(activeReview.reviewId, 'Approved')}
                    className="w-1/2 justify-center text-xs"
                  >
                    Approve Patent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReviewDecision(activeReview.reviewId, 'Changes Requested')}
                    className="w-1/2 justify-center text-xs"
                  >
                    Request Changes
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* 3. Field Comments & Difference Viewer Launch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Comments Overview Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-light" />
                Inline Field Comment Threads
              </CardTitle>
              <CardDescription>Discussion threads mapped to patent specification fields</CardDescription>
            </div>

            <Button variant="primary" size="sm" icon={MessageSquare} onClick={() => setIsCommentDrawerOpen(true)}>
              Open Drawer
            </Button>
          </div>

          <div className="space-y-3 text-xs pt-2">
            {comments.slice(0, 2).map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary-light">{c.field}</span>
                  <Badge variant={c.resolved ? 'success' : 'warning'} size="sm">
                    {c.resolved ? 'Resolved' : 'Open'}
                  </Badge>
                </div>
                <p className="text-text-main font-semibold">{c.author}: "{c.text}"</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Version History & Diff Viewer Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-secondary-light" />
                Version Control & Text Diff
              </CardTitle>
              <CardDescription>Compare text changes across draft iterations</CardDescription>
            </div>

            <Button variant="outline" size="sm" icon={GitBranch} onClick={() => setIsDiffModalOpen(true)}>
              Compare Diff
            </Button>
          </div>

          <div className="space-y-3 text-xs pt-2 font-mono">
            <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-main">Version 2.0 (Enhanced Draft)</span>
                <span className="text-text-subtle text-[10px]">2026-07-25</span>
              </div>
              <p className="text-text-muted text-[11px] font-sans">Applied numerical flow velocity and gate-oxide channel updates.</p>
            </div>

            <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-subtle">Version 1.0 (Original Submission)</span>
                <span className="text-text-subtle text-[10px]">2026-07-20</span>
              </div>
              <p className="text-text-muted text-[11px] font-sans">Initial patent submission draft.</p>
            </div>
          </div>
        </Card>

      </div>

      {/* 4. Real-Time Activity Log Feed */}
      <Card className="p-6 space-y-4">
        <CardHeader className="mb-0">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-success" />
            Real-Time Collaboration Activity Feed
          </CardTitle>
          <CardDescription>Live audit trail of workspace modifications, comments, and approvals</CardDescription>
        </CardHeader>

        <div className="space-y-2 text-xs font-mono pt-2">
          {activities.map((act) => (
            <div key={act.id} className="p-2.5 rounded-xl bg-[#0F172A] border border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="font-bold text-text-main">{act.user}</span>
                <span className="text-primary-light font-bold"> [{act.action}]</span>
                <p className="text-text-subtle text-[11px] font-sans">{act.details}</p>
              </div>
              <span className="text-[10px] text-text-subtle shrink-0">{act.timestamp}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Modals & Drawers */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
      />

      <CommentThreadDrawer
        isOpen={isCommentDrawerOpen}
        onClose={() => setIsCommentDrawerOpen(false)}
        comments={comments}
        onAddComment={handleAddComment}
        onReply={handleReplyComment}
        onToggleResolve={handleToggleResolve}
      />

      <DifferenceViewerModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
      />

    </div>
  );
};

export default CollaborationView;
