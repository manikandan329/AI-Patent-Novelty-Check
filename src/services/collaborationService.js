import { doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

// Initial Team Members List
export const INITIAL_TEAM_MEMBERS = [
  {
    id: 'mem-1',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@patentiq.ai',
    role: 'Owner',
    status: 'Accepted',
    avatarColor: '#2563EB',
    joinedDate: '2026-07-20',
  },
  {
    id: 'mem-2',
    name: 'Attorney Marcus Vance',
    email: 'marcus.vance@innovate-ip.com',
    role: 'Reviewer',
    status: 'Accepted',
    avatarColor: '#6366F1',
    joinedDate: '2026-07-22',
  },
  {
    id: 'mem-3',
    name: 'Prof. Sarah Chen',
    email: 'sarah.chen@university-dsa.edu',
    role: 'Editor',
    status: 'Accepted',
    avatarColor: '#22C55E',
    joinedDate: '2026-07-24',
  },
  {
    id: 'mem-4',
    name: 'Alexander Vance',
    email: 'alex.vance@startup-partner.io',
    role: 'Viewer',
    status: 'Pending',
    avatarColor: '#F59E0B',
    joinedDate: '2026-07-25',
  },
];

// Initial Inline Comment Threads
export const INITIAL_COMMENTS = [
  {
    id: 'comm-1',
    field: 'Novel Features',
    fieldLabel: 'Monolithic Gate-Oxide Dielectric Micro-Cooling',
    author: 'Attorney Marcus Vance',
    role: 'Reviewer',
    avatarColor: '#6366F1',
    text: 'Please clarify the laminar coolant flow velocity threshold in element 1b to ensure non-obviousness over US-2026-0098412-A1.',
    timestamp: '2026-07-25 14:30',
    resolved: false,
    replies: [
      {
        id: 'rep-1',
        author: 'Dr. Elena Rostova',
        role: 'Owner',
        text: 'Added numerical flow velocity ratio (0.4m/s to 1.2m/s) in claim 3.',
        timestamp: '2026-07-25 15:10',
      },
    ],
  },
  {
    id: 'comm-2',
    field: 'Problem Statement',
    fieldLabel: 'Thermal Dissipation in CMOS Processors',
    author: 'Prof. Sarah Chen',
    role: 'Editor',
    avatarColor: '#22C55E',
    text: 'Updated thermal dissipation energy reduction from 30% to 40% based on lab bench prototype validation.',
    timestamp: '2026-07-24 11:15',
    resolved: true,
    replies: [],
  },
];

// Initial Review Requests & Approvals
export const INITIAL_REVIEWS = [
  {
    reviewId: 'rev-101',
    reviewerName: 'Attorney Marcus Vance',
    reviewerEmail: 'marcus.vance@innovate-ip.com',
    requestedBy: 'Dr. Elena Rostova',
    status: 'Approved',
    decision: 'Approved for Formal Filing',
    remarks: 'Patent specification and claim 1-5 elements are clear, novel, and free of direct prior art infringement risks.',
    date: '2026-07-25',
  },
  {
    reviewId: 'rev-102',
    reviewerName: 'Prof. Sarah Chen',
    reviewerEmail: 'sarah.chen@university-dsa.edu',
    requestedBy: 'Dr. Elena Rostova',
    status: 'Changes Requested',
    decision: 'Changes Requested',
    remarks: 'Add explicit piezo-electric diaphragm pressure bounds in dependent claim 4.',
    date: '2026-07-24',
  },
];

// Initial Activity Timeline Logs
export const INITIAL_COLLAB_ACTIVITIES = [
  { id: 'act-1', user: 'Attorney Marcus Vance', action: 'Approved Patent Review', details: 'Status set to Approved for Formal Filing', timestamp: '2026-07-25 16:00' },
  { id: 'act-2', user: 'Dr. Elena Rostova', action: 'Created Patent Version 2', details: 'Applied numerical aspect ratio & flow velocity updates', timestamp: '2026-07-25 15:20' },
  { id: 'act-3', user: 'Attorney Marcus Vance', action: 'Commented on Novel Features', details: 'Requested laminar coolant velocity clarification', timestamp: '2026-07-25 14:30' },
  { id: 'act-4', user: 'Dr. Elena Rostova', action: 'Invited Member', details: 'Sent Viewer invite to alex.vance@startup-partner.io', timestamp: '2026-07-25 10:00' },
];

/**
 * Retrieves Team Members for a patent workspace.
 */
export const getTeamMembers = async (submissionId) => {
  const stored = localStorage.getItem(`patentiq_team_${submissionId || 'demo'}`);
  if (stored) return JSON.parse(stored);

  localStorage.setItem(`patentiq_team_${submissionId || 'demo'}`, JSON.stringify(INITIAL_TEAM_MEMBERS));
  return INITIAL_TEAM_MEMBERS;
};

/**
 * Invites a new team member with role permissions.
 */
export const inviteTeamMember = async (submissionId, email, role, name = '') => {
  const members = await getTeamMembers(submissionId);
  const newMember = {
    id: `mem-${Date.now()}`,
    name: name || email.split('@')[0],
    email,
    role,
    status: 'Pending',
    avatarColor: '#2563EB',
    joinedDate: new Date().toISOString().split('T')[0],
  };

  const updated = [...members, newMember];
  localStorage.setItem(`patentiq_team_${submissionId || 'demo'}`, JSON.stringify(updated));
  logCollabActivity(submissionId, 'Invited Team Member', `Sent ${role} invitation to ${email}`);
  return updated;
};

/**
 * Updates member role or removes member.
 */
export const updateTeamMemberRole = async (submissionId, memberId, newRole) => {
  const members = await getTeamMembers(submissionId);
  const updated = members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m));
  localStorage.setItem(`patentiq_team_${submissionId || 'demo'}`, JSON.stringify(updated));
  return updated;
};

export const removeTeamMember = async (submissionId, memberId) => {
  const members = await getTeamMembers(submissionId);
  const updated = members.filter((m) => m.id !== memberId);
  localStorage.setItem(`patentiq_team_${submissionId || 'demo'}`, JSON.stringify(updated));
  return updated;
};

/**
 * In-Context Comment System Functions.
 */
export const getCommentThreads = async (submissionId) => {
  const stored = localStorage.getItem(`patentiq_comments_${submissionId || 'demo'}`);
  if (stored) return JSON.parse(stored);

  localStorage.setItem(`patentiq_comments_${submissionId || 'demo'}`, JSON.stringify(INITIAL_COMMENTS));
  return INITIAL_COMMENTS;
};

export const addCommentThread = async (submissionId, field, fieldLabel, author, role, text) => {
  const comments = await getCommentThreads(submissionId);
  const newComment = {
    id: `comm-${Date.now()}`,
    field,
    fieldLabel,
    author,
    role,
    avatarColor: '#2563EB',
    text,
    timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    resolved: false,
    replies: [],
  };

  const updated = [newComment, ...comments];
  localStorage.setItem(`patentiq_comments_${submissionId || 'demo'}`, JSON.stringify(updated));
  logCollabActivity(submissionId, 'Added Comment Thread', `Commented on ${field}`);
  return updated;
};

export const addReplyToComment = async (submissionId, commentId, author, role, replyText) => {
  const comments = await getCommentThreads(submissionId);
  const updated = comments.map((c) => {
    if (c.id === commentId) {
      return {
        ...c,
        replies: [
          ...c.replies,
          {
            id: `rep-${Date.now()}`,
            author,
            role,
            text: replyText,
            timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          },
        ],
      };
    }
    return c;
  });

  localStorage.setItem(`patentiq_comments_${submissionId || 'demo'}`, JSON.stringify(updated));
  return updated;
};

export const toggleResolveComment = async (submissionId, commentId) => {
  const comments = await getCommentThreads(submissionId);
  const updated = comments.map((c) => (c.id === commentId ? { ...c, resolved: !c.resolved } : c));
  localStorage.setItem(`patentiq_comments_${submissionId || 'demo'}`, JSON.stringify(updated));
  return updated;
};

/**
 * Review Approval Workflow Functions.
 */
export const getReviewRequests = async (submissionId) => {
  const stored = localStorage.getItem(`patentiq_reviews_${submissionId || 'demo'}`);
  if (stored) return JSON.parse(stored);

  localStorage.setItem(`patentiq_reviews_${submissionId || 'demo'}`, JSON.stringify(INITIAL_REVIEWS));
  return INITIAL_REVIEWS;
};

export const submitReviewDecision = async (submissionId, reviewId, decision, remarks) => {
  const reviews = await getReviewRequests(submissionId);
  const updated = reviews.map((r) => (r.reviewId === reviewId ? { ...r, status: decision, decision, remarks } : r));
  localStorage.setItem(`patentiq_reviews_${submissionId || 'demo'}`, JSON.stringify(updated));
  logCollabActivity(submissionId, 'Submitted Review Decision', `Decision: ${decision}`);
  return updated;
};

/**
 * Text Difference Calculator (Diff Engine).
 * Compares Version A vs Version B and returns highlighted diff tokens.
 */
export const calculateTextDiff = (textA = '', textB = '') => {
  const wordsA = textA.split(/\s+/);
  const wordsB = textB.split(/\s+/);

  const diffResult = [];

  // Simple token diff matcher
  let i = 0;
  let j = 0;

  while (i < wordsA.length || j < wordsB.length) {
    if (i < wordsA.length && j < wordsB.length && wordsA[i] === wordsB[j]) {
      diffResult.push({ type: 'unchanged', text: wordsA[i] });
      i++;
      j++;
    } else if (j < wordsB.length && (!wordsA.includes(wordsB[j]) || wordsB.indexOf(wordsA[i]) > j)) {
      diffResult.push({ type: 'added', text: wordsB[j] });
      j++;
    } else if (i < wordsA.length) {
      diffResult.push({ type: 'removed', text: wordsA[i] });
      i++;
    }
  }

  return diffResult;
};

/**
 * Collaboration Activity Logger.
 */
export const getCollabActivities = async (submissionId) => {
  const stored = localStorage.getItem(`patentiq_activities_${submissionId || 'demo'}`);
  if (stored) return JSON.parse(stored);

  localStorage.setItem(`patentiq_activities_${submissionId || 'demo'}`, JSON.stringify(INITIAL_COLLAB_ACTIVITIES));
  return INITIAL_COLLAB_ACTIVITIES;
};

export const logCollabActivity = async (submissionId, action, details) => {
  const newAct = {
    id: `act-${Date.now()}`,
    user: 'Dr. Elena Rostova',
    action,
    details,
    timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
  };

  const activities = await getCollabActivities(submissionId);
  const updated = [newAct, ...activities];
  localStorage.setItem(`patentiq_activities_${submissionId || 'demo'}`, JSON.stringify(updated));
  return updated;
};
