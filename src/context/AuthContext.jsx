import React, { createContext, useState, useEffect } from 'react';
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  loginWithDemoAccount,
  resetUserPassword,
  dispatchEmailVerification,
  logoutUser,
  subscribeToAuthState,
} from '../firebase/authService';
import { getUserProfile } from '../firebase/userService';
import toast from 'react-hot-toast';

export const AuthContext = createContext({
  currentUser: null,
  userProfile: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  loginGoogle: async () => {},
  loginDemo: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  resendVerification: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user, profile) => {
      setCurrentUser(user);
      setUserProfile(profile);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (currentUser?.uid) {
      const updated = await getUserProfile(currentUser.uid);
      if (updated) setUserProfile(updated);
    }
  };

  const login = async (email, password) => {
    try {
      const { user, profile, isDemo } = await loginWithEmail(email, password);
      setCurrentUser(user);
      setUserProfile(profile);
      toast.success(`Welcome back, ${profile?.name || 'User'}!`);
      if (isDemo) {
        toast('Running in local environment mode. Firebase credentials active.', {
          icon: '⚡',
          style: { background: '#1E293B', color: '#F8FAFC', border: '1px solid #334155' }
        });
      }
      return { success: true };
    } catch (error) {
      console.error("Login Error:", error);
      const msg = getFriendlyErrorMessage(error.code || error.message);
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const loginDemo = async () => {
    try {
      const { user, profile } = await loginWithDemoAccount();
      setCurrentUser(user);
      setUserProfile(profile);
      toast.success('Logged in as Demo User (Researcher)');
      toast('Demo session active: Full features unlocked for project review.', {
        icon: '🚀',
        style: { background: '#1E293B', color: '#38BDF8', border: '1px solid #0284C7' }
      });
      return { success: true };
    } catch (error) {
      console.error("Demo Login Error:", error);
      toast.error('Could not start demo mode.');
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { user, profile, isDemo } = await registerWithEmail(name, email, password);
      setCurrentUser(user);
      setUserProfile(profile);
      toast.success('Account registered successfully!');
      toast('Verification link sent to ' + email, { icon: '✉️' });
      if (isDemo) {
        toast('User profile document initialized in Firestore.', {
          icon: '📄',
          style: { background: '#1E293B', color: '#F8FAFC', border: '1px solid #334155' }
        });
      }
      return { success: true };
    } catch (error) {
      console.error("Registration Error:", error);
      const msg = getFriendlyErrorMessage(error.code || error.message);
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const loginGoogle = async () => {
    try {
      const { user, profile } = await loginWithGoogle();
      setCurrentUser(user);
      setUserProfile(profile);
      toast.success(`Signed in with Google as ${profile?.name}!`);
      return { success: true };
    } catch (error) {
      console.error("Google Auth Error:", error);
      const msg = getFriendlyErrorMessage(error.code || error.message);
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const resetPassword = async (email) => {
    try {
      await resetUserPassword(email);
      toast.success('Password reset link sent to your email.');
      return { success: true };
    } catch (error) {
      console.error("Reset Password Error:", error);
      const msg = getFriendlyErrorMessage(error.code || error.message);
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const resendVerification = async () => {
    try {
      const sent = await dispatchEmailVerification();
      if (sent) {
        toast.success('Verification email sent!');
      } else {
        toast.error('Could not send verification email.');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserProfile(null);
      toast.success('Logged out successfully.');
    } catch (error) {
      toast.error('Error logging out.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        login,
        register,
        loginGoogle,
        loginDemo,
        logout,
        resetPassword,
        resendVerification,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Friendly Firebase Error Code Translator
function getFriendlyErrorMessage(codeOrMessage) {
  if (!codeOrMessage) return 'An authentication error occurred.';
  if (codeOrMessage.includes('auth/invalid-credential') || codeOrMessage.includes('auth/wrong-password')) {
    return 'Invalid email or password. Please try again.';
  }
  if (codeOrMessage.includes('auth/user-not-found')) {
    return 'No registered account found with this email.';
  }
  if (codeOrMessage.includes('auth/email-already-in-use')) {
    return 'An account with this email address already exists.';
  }
  if (codeOrMessage.includes('auth/weak-password')) {
    return 'Password is too weak. Please use at least 6 characters with mixed case and numbers.';
  }
  if (codeOrMessage.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (codeOrMessage.includes('auth/too-many-requests')) {
    return 'Access blocked due to unusual activity. Try again later.';
  }
  return codeOrMessage || 'An authentication error occurred.';
}
