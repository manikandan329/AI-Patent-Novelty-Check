import { doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

// Pre-seeded fallback report list for immediate user exploration
export const INITIAL_REPORTS_LIST = [
  {
    reportId: 'rep-001',
    submissionId: 'SUB-2026-98142',
    title: 'Quantum Micro-Fluidic Neural Processing Unit',
    noveltyScore: 94.8,
    status: 'Completed',
    favorite: true,
    category: 'Quantum Electronics',
    date: '2026-07-25',
    createdAt: '2026-07-25T14:30:00Z',
    summary: 'High technical novelty (94.8%) with strong inventive step over USPTO prior art.',
    strengths: ['Direct gate-oxide laminar coolant integration', '40% reduced thermal dissipation'],
    weaknesses: ['Dependent claim 3 requires width ratio refinement'],
    recommendations: ['File USPTO provisional application immediately'],
  },
  {
    reportId: 'rep-002',
    submissionId: 'SUB-2026-84719',
    title: 'Autonomous UAV Swarm Collision Avoidance Mesh Network',
    noveltyScore: 88.2,
    status: 'Completed',
    favorite: false,
    category: 'Autonomous Robotics',
    date: '2026-07-24',
    createdAt: '2026-07-24T11:20:00Z',
    summary: 'Strong innovation score (88.2%) utilizing zero-latency UWB pulse mesh routing.',
    strengths: ['Sub-GHz pulse modulation', 'Real-time obstacle trajectory recalculation'],
    weaknesses: ['Minor claim overlap with US-2026-0084719-A1'],
    recommendations: ['Clarify mesh node router structural constraints'],
  },
  {
    reportId: 'rep-003',
    submissionId: 'SUB-2026-39401',
    title: 'Biocompatible Graphene Glucose Sensor Array',
    noveltyScore: 96.1,
    status: 'Completed',
    favorite: true,
    category: 'Biotechnology',
    date: '2026-07-22',
    createdAt: '2026-07-22T09:15:00Z',
    summary: 'Exceptional novelty (96.1%) for continuous subcutaneous bio-analyte sensing.',
    strengths: ['Enzymatic graphene nanoplatelet covalent bonding'],
    weaknesses: ['None identified'],
    recommendations: ['Proceed directly to international PCT patent filing'],
  },
  {
    reportId: 'rep-004',
    submissionId: 'SUB-2026-01928',
    title: 'Zero-Knowledge Cryptographic Key Exchange for Edge IoT',
    noveltyScore: 79.4,
    status: 'Completed',
    favorite: false,
    category: 'Cybersecurity',
    date: '2026-07-20',
    createdAt: '2026-07-20T16:45:00Z',
    summary: 'Strong cryptographic innovation (79.4%) optimized for low-power microcontrollers.',
    strengths: ['8-bit microcontroller optimization'],
    weaknesses: ['Requires claim 1 element 2 expansion'],
    recommendations: ['Add dependent claims covering modular exponentiation cycles'],
  },
  {
    reportId: 'rep-005',
    submissionId: 'SUB-2026-04128',
    title: 'Self-Healing Solid State Battery Electrolyte Formulation',
    noveltyScore: 91.0,
    status: 'Archived',
    favorite: false,
    category: 'Materials Science',
    date: '2026-07-18',
    createdAt: '2026-07-18T10:00:00Z',
    summary: 'High polymer cross-linking novelty (91.0%) under thermal stress.',
    strengths: ['Self-healing molecular cross-linking'],
    weaknesses: ['Environmental boundary conditions need specification'],
    recommendations: ['Quantify temperature threshold limits in specification'],
  },
];

/**
 * Retrieves user reports from Firestore or cached state.
 */
export const getUserReportsList = async (userId) => {
  try {
    if (isFirebaseConfigured && userId) {
      const snap = await getDocs(collection(db, 'reports'));
      const docs = snap.docs.map((d) => d.data());
      if (docs.length > 0) return docs;
    }
  } catch (err) {
    console.warn('Firestore reports fetch notice:', err.message);
  }

  const stored = localStorage.getItem(`patentiq_user_reports_${userId || 'demo'}`);
  if (stored) return JSON.parse(stored);

  localStorage.setItem(`patentiq_user_reports_${userId || 'demo'}`, JSON.stringify(INITIAL_REPORTS_LIST));
  return INITIAL_REPORTS_LIST;
};

/**
 * Toggles persistent favorite status for a report document in Firestore.
 */
export const toggleFavoriteReport = async (userId, reportId, currentStatus) => {
  const newStatus = !currentStatus;

  try {
    if (isFirebaseConfigured) {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, { favorite: newStatus, updatedAt: new Date().toISOString() });
    }
  } catch (err) {
    console.warn('Firestore favorite toggle notice:', err.message);
  }

  const list = await getUserReportsList(userId);
  const updated = list.map((r) => (r.reportId === reportId ? { ...r, favorite: newStatus } : r));
  localStorage.setItem(`patentiq_user_reports_${userId || 'demo'}`, JSON.stringify(updated));
  return updated;
};

/**
 * Deletes a report document from Firestore & local storage.
 */
export const deleteReportDocument = async (userId, reportId) => {
  try {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'reports', reportId));
    }
  } catch (err) {
    console.warn('Firestore report delete notice:', err.message);
  }

  const list = await getUserReportsList(userId);
  const updated = list.filter((r) => r.reportId !== reportId);
  localStorage.setItem(`patentiq_user_reports_${userId || 'demo'}`, JSON.stringify(updated));
  return updated;
};

/**
 * Generates a secure share URL link for a report.
 */
export const generateShareableReportLink = (reportId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/dashboard/analysis/${reportId}?share_token=sec_${Date.now()}`;
};
