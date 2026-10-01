import { doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { PATENT_DATABASE_CORPUS } from './semanticSearchEngine';

// Initial pre-seeded Admin Users List
export const INITIAL_ADMIN_USERS = [
  {
    uid: 'u-101',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@patentiq.ai',
    role: 'admin',
    totalAnalyses: 142,
    reportsGenerated: 98,
    status: 'Active',
    joinedDate: '2026-01-15',
  },
  {
    uid: 'u-102',
    name: 'Marcus Vance',
    email: 'marcus.vance@innovate.io',
    role: 'user',
    totalAnalyses: 34,
    reportsGenerated: 21,
    status: 'Active',
    joinedDate: '2026-02-10',
  },
  {
    uid: 'u-103',
    name: 'Sarah Chen',
    email: 'sarah.chen@biotech-labs.com',
    role: 'user',
    totalAnalyses: 56,
    reportsGenerated: 42,
    status: 'Active',
    joinedDate: '2026-03-01',
  },
  {
    uid: 'u-104',
    name: 'Alexander Vance',
    email: 'alex.vance@security-edge.net',
    role: 'user',
    totalAnalyses: 12,
    reportsGenerated: 8,
    status: 'Suspended',
    joinedDate: '2026-04-18',
  },
];

// Initial System Audit Activity Logs
export const INITIAL_AUDIT_LOGS = [
  { id: 'log-1', action: 'FAISS Index Rebuilt', details: 'Rebuilt 142.8M vector embeddings in 1.42s', user: 'System Admin', timestamp: '2026-07-26 18:00:00' },
  { id: 'log-2', action: 'Bulk Dataset Imported', details: 'Imported 1,000 USPTO patent filings via CSV', user: 'Dr. Elena Rostova', timestamp: '2026-07-26 16:30:00' },
  { id: 'log-3', action: 'User Suspended', details: 'Suspended account alex.vance@security-edge.net', user: 'Admin Security', timestamp: '2026-07-25 11:20:00' },
  { id: 'log-4', action: 'Patent Record Added', details: 'Added US-2026-0098412-A1 to Quantum corpus', user: 'Dr. Elena Rostova', timestamp: '2026-07-24 09:15:00' },
  { id: 'log-5', action: 'System Health Check', details: 'All 5 AI services operating normally', user: 'System Watchdog', timestamp: '2026-07-24 00:00:00' },
];

/**
 * Returns complete Admin Dashboard overview stats.
 */
export const getAdminOverviewStats = async () => {
  return {
    totalUsers: 12540,
    totalSubmissions: 45890,
    totalPatentRecords: 142850900,
    totalAiAnalyses: 38410,
    avgNoveltyScore: 92.4,
    systemHealth: 'Healthy',
    storageUsage: '42.8 GB / 100 GB',
    faissIndexStatus: 'FAISS IndexFlatIP Active',
    lastIndexRebuild: '2026-07-26 18:00:00 UTC',
  };
};

/**
 * Retrieves Patent Knowledge Base Corpus records.
 */
export const getKnowledgeBasePatents = async (filters = {}) => {
  let patents = PATENT_DATABASE_CORPUS;

  const stored = localStorage.getItem('patentiq_admin_knowledge_base');
  if (stored) {
    patents = JSON.parse(stored);
  } else {
    localStorage.setItem('patentiq_admin_knowledge_base', JSON.stringify(PATENT_DATABASE_CORPUS));
  }

  return patents.filter((p) => {
    if (filters.domain && filters.domain !== 'All' && p.technologyDomain !== filters.domain) return false;
    if (filters.country && filters.country !== 'All' && p.country !== filters.country) return false;
    if (filters.search?.trim()) {
      const q = filters.search.toLowerCase();
      const matchId = p.patentId.toLowerCase().includes(q);
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchInventor = p.inventor?.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchInventor) return false;
    }
    return true;
  });
};

/**
 * Adds or edits a patent record in the Knowledge Base corpus.
 */
export const savePatentRecord = async (patentRecord) => {
  const current = await getKnowledgeBasePatents();
  const existsIndex = current.findIndex((p) => p.patentId === patentRecord.patentId);

  let updated;
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = patentRecord;
  } else {
    updated = [patentRecord, ...current];
  }

  localStorage.setItem('patentiq_admin_knowledge_base', JSON.stringify(updated));

  // Log action
  logAdminActivity(existsIndex >= 0 ? 'Patent Record Updated' : 'Patent Record Created', `Patent ID: ${patentRecord.patentId}`);
  return updated;
};

/**
 * Deletes a patent record from Knowledge Base corpus.
 */
export const deletePatentRecord = async (patentId) => {
  const current = await getKnowledgeBasePatents();
  const updated = current.filter((p) => p.patentId !== patentId);
  localStorage.setItem('patentiq_admin_knowledge_base', JSON.stringify(updated));

  logAdminActivity('Patent Record Deleted', `Deleted Patent ID: ${patentId}`);
  return updated;
};

/**
 * Bulk import CSV / JSON parser with duplicate detection.
 */
export const processBulkPatentImport = async (parsedRecords = []) => {
  const current = await getKnowledgeBasePatents();
  const currentMap = new Set(current.map((p) => p.patentId));

  let importedCount = 0;
  let duplicateCount = 0;

  const validNewRecords = [];

  for (const item of parsedRecords) {
    const patentId = item.patentId || `US-2026-${Math.floor(1000000 + Math.random() * 9000000)}-A1`;
    if (currentMap.has(patentId)) {
      duplicateCount++;
    } else {
      validNewRecords.push({
        patentId,
        title: item.title || 'Imported Patent Title',
        abstract: item.abstract || 'Imported patent abstract content.',
        claims: item.claims || '1. An imported patent claim structure...',
        technologyDomain: item.technologyDomain || 'General Science',
        inventor: item.inventor || 'Anonymous Inventor',
        publicationDate: item.publicationDate || new Date().toISOString().split('T')[0],
        country: item.country || 'United States',
        keywords: item.keywords ? item.keywords.split(',') : ['imported', 'patent'],
      });
      importedCount++;
    }
  }

  const merged = [...validNewRecords, ...current];
  localStorage.setItem('patentiq_admin_knowledge_base', JSON.stringify(merged));

  logAdminActivity('Bulk Dataset Imported', `Imported ${importedCount} records. Flagged ${duplicateCount} duplicates.`);

  return {
    importedCount,
    duplicateCount,
    totalNow: merged.length,
  };
};

/**
 * Admin User Management Functions.
 */
export const getAdminUsersList = async () => {
  const stored = localStorage.getItem('patentiq_admin_users');
  if (stored) return JSON.parse(stored);

  localStorage.setItem('patentiq_admin_users', JSON.stringify(INITIAL_ADMIN_USERS));
  return INITIAL_ADMIN_USERS;
};

export const toggleUserStatus = async (uid) => {
  const users = await getAdminUsersList();
  const updated = users.map((u) => {
    if (u.uid === uid) {
      const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
      logAdminActivity(`User Account ${newStatus}`, `Target User: ${u.email}`);
      return { ...u, status: newStatus };
    }
    return u;
  });
  localStorage.setItem('patentiq_admin_users', JSON.stringify(updated));
  return updated;
};

export const deleteUserAccount = async (uid) => {
  const users = await getAdminUsersList();
  const updated = users.filter((u) => u.uid !== uid);
  localStorage.setItem('patentiq_admin_users', JSON.stringify(updated));
  logAdminActivity('User Account Deleted', `Deleted User UID: ${uid}`);
  return updated;
};

/**
 * System Audit Activity Logger.
 */
export const getSystemAuditLogs = async () => {
  const stored = localStorage.getItem('patentiq_admin_logs');
  if (stored) return JSON.parse(stored);

  localStorage.setItem('patentiq_admin_logs', JSON.stringify(INITIAL_AUDIT_LOGS));
  return INITIAL_AUDIT_LOGS;
};

export const logAdminActivity = async (action, details) => {
  const newLog = {
    id: `log-${Date.now()}`,
    action,
    details,
    user: 'System Admin',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };

  const logs = await getSystemAuditLogs();
  const updated = [newLog, ...logs];
  localStorage.setItem('patentiq_admin_logs', JSON.stringify(updated));
  return updated;
};
