import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';

/**
 * Automatically initializes or merges a Firestore user profile document upon signup or login.
 * 
 * Firestore Collection: "users"
 * Document ID: user.uid
 * 
 * Fields created:
 * - uid
 * - name
 * - email
 * - profileImage
 * - joinedDate
 * - lastLogin
 * - role
 * - totalAnalyses
 * - reportsGenerated
 * - averageNovelty
 */
export const initializeUserProfile = async (user, additionalData = {}) => {
  if (!user || !user.uid) return null;

  const userRef = doc(db, 'users', user.uid);
  const nowISO = new Date().toISOString();

  const defaultProfile = {
    uid: user.uid,
    name: additionalData.name || user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email,
    profileImage: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || user.uid)}`,
    joinedDate: nowISO,
    lastLogin: nowISO,
    role: 'user',
    totalAnalyses: 0,
    reportsGenerated: 0,
    averageNovelty: 0,
  };

  try {
    if (isFirebaseConfigured) {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, defaultProfile);
        return defaultProfile;
      } else {
        // Update lastLogin on existing account
        await updateDoc(userRef, {
          lastLogin: nowISO,
          ...(additionalData.name ? { name: additionalData.name } : {}),
        });
        return { ...snap.data(), lastLogin: nowISO };
      }
    }
  } catch (error) {
    console.warn("Firestore service notice (Fallback mode active if project unlinked):", error.message);
  }

  // Fallback state for seamless client performance when environment keys are standard defaults
  const storedProfile = localStorage.getItem(`patentiq_user_${user.uid}`);
  if (storedProfile) {
    const parsed = JSON.parse(storedProfile);
    parsed.lastLogin = nowISO;
    localStorage.setItem(`patentiq_user_${user.uid}`, JSON.stringify(parsed));
    return parsed;
  }

  localStorage.setItem(`patentiq_user_${user.uid}`, JSON.stringify(defaultProfile));
  return defaultProfile;
};

/**
 * Fetches the user profile document from Firestore.
 */
export const getUserProfile = async (uid) => {
  if (!uid) return null;

  try {
    if (isFirebaseConfigured) {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data();
      }
    }
  } catch (error) {
    console.warn("Error fetching user profile from Firestore:", error.message);
  }

  const stored = localStorage.getItem(`patentiq_user_${uid}`);
  return stored ? JSON.parse(stored) : null;
};

/**
 * Updates specified user profile fields in Firestore.
 */
export const updateUserProfileData = async (uid, updateFields) => {
  if (!uid) return null;

  try {
    if (isFirebaseConfigured) {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updateFields);
    }
  } catch (error) {
    console.warn("Error updating user profile in Firestore:", error.message);
  }

  const stored = localStorage.getItem(`patentiq_user_${uid}`);
  if (stored) {
    const parsed = JSON.parse(stored);
    const updated = { ...parsed, ...updateFields };
    localStorage.setItem(`patentiq_user_${uid}`, JSON.stringify(updated));
    return updated;
  }
  return null;
};
