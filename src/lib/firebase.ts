import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBgk6r_OseUsmtoikoFq61kW1cFy8LTcWQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "popiwarningapp.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "popiwarningapp",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "popiwarningapp.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "791836519675",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:791836519675:web:38de74d0308d341890945e",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-LVPT7G23EJ",
};

// Initialize Firebase
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fallback initialization
  app = initializeApp(firebaseConfig);
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Firebase Cloud Messaging
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Only connect to emulators if not already connected
  if (!auth.emulatorConfig) {
    // connectAuthEmulator(auth, 'http://localhost:9099');
  }
  // Note: Firestore emulator connection is handled automatically in development
}

// FCM token management
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) return null;
  
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'your-vapid-key'
    });
    
    if (token) {
      console.log('FCM token:', token);
      return token;
    } else {
      console.log('No registration token available.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) return;
  return onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });
};