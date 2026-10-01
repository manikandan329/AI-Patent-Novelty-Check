import { doc, collection, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, isFirebaseConfigured } from '../firebase/config';

/**
 * Saves a patent submission draft to Firestore or localStorage.
 */
export const savePatentSubmissionDraft = async (userId, formData) => {
  if (!userId) return null;

  const nowISO = new Date().toISOString();
  const draftData = {
    userId,
    ...formData,
    draftStatus: 'draft',
    updatedAt: nowISO,
  };

  try {
    if (isFirebaseConfigured) {
      const draftRef = doc(db, 'patent_drafts', userId);
      await setDoc(draftRef, draftData, { merge: true });
    }
  } catch (err) {
    console.warn('Firestore draft save notice:', err.message);
  }

  // Local storage backup for instant offline autosave responsiveness
  localStorage.setItem(`patentiq_draft_${userId}`, JSON.stringify(draftData));
  return draftData;
};

/**
 * Loads a cached patent draft for user.
 */
export const loadPatentSubmissionDraft = async (userId) => {
  if (!userId) return null;

  try {
    if (isFirebaseConfigured) {
      const draftRef = doc(db, 'patent_drafts', userId);
      const snap = await getDoc(draftRef);
      if (snap.exists()) {
        return snap.data();
      }
    }
  } catch (err) {
    console.warn('Firestore draft load notice:', err.message);
  }

  const stored = localStorage.getItem(`patentiq_draft_${userId}`);
  return stored ? JSON.parse(stored) : null;
};

/**
 * Clears cached draft for user after successful submission.
 */
export const clearPatentSubmissionDraft = (userId) => {
  if (!userId) return;
  localStorage.removeItem(`patentiq_draft_${userId}`);
};

/**
 * Submits the completed patent document to Firestore `patent_submissions` collection.
 */
export const submitFinalPatentSubmission = async (userId, formData, uploadedFilesList = []) => {
  if (!userId) throw new Error('User authentication required for submission');

  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const submissionId = `SUB-2026-${randomDigits}`;
  const nowISO = new Date().toISOString();

  // Process uploaded files metadata
  const fileMetadataList = uploadedFilesList.map((f, idx) => ({
    fileId: `file_${idx}_${Date.now()}`,
    name: f.name || `Document_${idx + 1}.pdf`,
    size: f.size || 1024 * 500,
    type: f.type || 'application/pdf',
    url: f.url || `https://storage.googleapis.com/patentiq-docs/${submissionId}/${f.name || 'document.pdf'}`,
  }));

  const payload = {
    submissionId,
    userId,
    title: formData.title,
    category: formData.category,
    technologyDomain: formData.technologyDomain,
    keywords: formData.keywords || [],
    summary: formData.summary,
    problemStatement: formData.problemStatement,
    existingSolution: formData.existingSolution,
    proposedSolution: formData.proposedSolution,
    novelFeatures: formData.novelFeatures,
    workingPrinciple: formData.workingPrinciple,
    advantages: formData.advantages,
    applications: formData.applications,
    limitations: formData.limitations || '',
    uploadedFiles: fileMetadataList,
    inventorInformation: {
      inventorName: formData.inventorName || 'Anonymous Inventor',
      organization: formData.organization || 'Independent',
      email: formData.email || '',
      country: formData.country || 'United States',
      state: formData.state || '',
      city: formData.city || '',
      visibility: formData.visibility || 'Private',
    },
    draftStatus: 'submitted',
    submissionStatus: 'Pending Evaluation',
    createdAt: nowISO,
    updatedAt: nowISO,
  };

  try {
    if (isFirebaseConfigured) {
      const subRef = doc(db, 'patent_submissions', submissionId);
      await setDoc(subRef, payload);
    }
  } catch (err) {
    console.warn('Firestore submission notice (Fallback active):', err.message);
  }

  // Clear draft cache
  clearPatentSubmissionDraft(userId);

  return payload;
};
