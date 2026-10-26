import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log("Firebase API Key loaded:", firebaseConfig.apiKey);
console.log("Firebase Project ID:", firebaseConfig.projectId);

console.log("Firebase config check:", {
  projectId: firebaseConfig.projectId,
  apiKeyLoaded: Boolean(firebaseConfig.apiKey),
  apiKeyLength: firebaseConfig.apiKey?.length,
  authDomain: firebaseConfig.authDomain
});

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

// Fallback configuration prevents Firebase initialization errors when env vars are not set
const fallbackConfig = {
  apiKey: "mock-api-key-for-local-demo",
  authDomain: "patentiq-demo.firebaseapp.com",
  projectId: "patentiq-demo-app",
  storageBucket: "patentiq-demo-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = getApps().length ? getApp() : initializeApp(isFirebaseConfigured ? firebaseConfig : fallbackConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;