import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './config';
import { initializeUserProfile } from './userService';

/**
 * Realistic Demo User Constants for Instant Demonstration
 */
export const DEMO_USER = {
  uid: 'user_demo_patentiq_2026',
  email: 'demo@patentiq.com',
  displayName: 'Demo User',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  emailVerified: true,
  isDemo: true,
};

export const DEMO_PROFILE = {
  uid: 'user_demo_patentiq_2026',
  name: 'Demo User',
  email: 'demo@patentiq.com',
  profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  joinedDate: '2026-01-15T08:00:00.000Z',
  lastLogin: new Date().toISOString(),
  role: 'Researcher',
  accountType: 'Demo Account',
  isDemoMode: true,
  totalAnalyses: 128,
  reportsGenerated: 94,
  averageNovelty: 92.4,
};

/**
 * Login using local Demo Account (bypasses Firebase Auth & OAuth errors).
 */
export const loginWithDemoAccount = async () => {
  const session = {
    user: DEMO_USER,
    profile: DEMO_PROFILE,
    isDemo: true,
  };
  localStorage.setItem('patentiq_active_user', JSON.stringify(session));
  return session;
};

/**
 * Register user with Email & Password.
 * Triggers automatic Firestore profile creation & Email verification.
 */
export const registerWithEmail = async (name, email, password) => {
  if (!isFirebaseConfigured) {
    const mockUid = 'user_' + Date.now();
    const mockUser = {
      uid: mockUid,
      email,
      displayName: name,
      emailVerified: true,
    };
    const profile = await initializeUserProfile(mockUser, { name });
    localStorage.setItem('patentiq_active_user', JSON.stringify({ user: mockUser, profile }));
    return { user: mockUser, profile, isDemo: true };
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update Auth Profile Display Name
  await updateProfile(user, { displayName: name });

  // Send Email Verification link
  try {
    await sendEmailVerification(user);
  } catch (err) {
    console.warn("Could not dispatch email verification:", err.message);
  }

  // Initialize Firestore Document
  const profile = await initializeUserProfile(user, { name });
  return { user, profile };
};

/**
 * Login user with Email & Password.
 */
export const loginWithEmail = async (email, password) => {
  if (!isFirebaseConfigured) {
    const mockUser = {
      uid: 'user_demo_123',
      email,
      displayName: email.split('@')[0],
      emailVerified: true,
    };
    const profile = await initializeUserProfile(mockUser, { name: mockUser.displayName });
    localStorage.setItem('patentiq_active_user', JSON.stringify({ user: mockUser, profile }));
    return { user: mockUser, profile, isDemo: true };
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const profile = await initializeUserProfile(user);
  return { user, profile };
};

/**
 * Login / Register using Google OAuth Provider.
 */
export const loginWithGoogle = async () => {
  if (!isFirebaseConfigured) {
    const mockUser = {
      uid: 'user_google_' + Date.now(),
      email: 'alex.patents@gmail.com',
      displayName: 'Alex Morgan',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      emailVerified: true,
    };
    const profile = await initializeUserProfile(mockUser, { name: mockUser.displayName });
    localStorage.setItem('patentiq_active_user', JSON.stringify({ user: mockUser, profile }));
    return { user: mockUser, profile, isDemo: true };
  }

  const userCredential = await signInWithPopup(auth, googleProvider);
  const user = userCredential.user;
  const profile = await initializeUserProfile(user);
  return { user, profile };
};

/**
 * Dispatch Password Reset Email.
 */
export const resetUserPassword = async (email) => {
  if (!isFirebaseConfigured) {
    return true;
  }
  await sendPasswordResetEmail(auth, email);
  return true;
};

/**
 * Dispatch Email Verification link again.
 */
export const dispatchEmailVerification = async () => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
    return true;
  }
  return false;
};

/**
 * Logout current authenticated session.
 */
export const logoutUser = async () => {
  localStorage.removeItem('patentiq_active_user');
  if (isFirebaseConfigured) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("SignOut notice:", e.message);
    }
  }
  return true;
};

/**
 * Helper to retrieve stored demo session if active.
 */
const getStoredDemoUser = () => {
  const stored = localStorage.getItem('patentiq_active_user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.isDemo && parsed?.user) {
        return parsed;
      }
    } catch (e) {
      console.error("Error parsing stored demo session:", e);
    }
  }
  return null;
};

/**
 * Firebase Auth State Listener with Demo Session Persistence.
 */
export const subscribeToAuthState = (callback) => {
  if (!isFirebaseConfigured) {
    const stored = getStoredDemoUser();
    if (stored) {
      callback(stored.user, stored.profile);
    } else {
      callback(null, null);
    }
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await initializeUserProfile(user);
      callback(user, profile);
    } else {
      // Fallback check for active demo user session when Firebase user is null
      const demoSession = getStoredDemoUser();
      if (demoSession) {
        callback(demoSession.user, demoSession.profile);
      } else {
        callback(null, null);
      }
    }
  });
};
