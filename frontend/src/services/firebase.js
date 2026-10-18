// NISHPaksh AI - Firebase Cloud Database & Real-Time Sync Service
// Provides live multi-device synchronization across Field Officer, FSL, Zonal HQ, and Court.
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL
} from 'firebase/storage';

// Default project config from Firebase Console
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBbUk_AvncvsoosFvdIBwXzkNLHAgjLavo",
  authDomain: "nishpaksh-ai.firebaseapp.com",
  projectId: "nishpaksh-ai",
  storageBucket: "nishpaksh-ai.firebasestorage.app",
  messagingSenderId: "279796956270",
  appId: "1:279796956270:web:b111777d49fa547270fa7f",
  measurementId: "G-QCJMN38L4S"
};

// 1. Resolve Configuration from LocalStorage, Vite Environment Variables, or Default
export function getStoredFirebaseConfig() {
  try {
    const custom = localStorage.getItem('nishpaksh_firebase_config');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return { config: parsed, source: 'localStorage' };
      }
    }
  } catch (e) {
    // ignore
  }

  const envConfig = {
    apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: import.meta.env?.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return { config: envConfig, source: 'active' };
  }

  return { config: DEFAULT_FIREBASE_CONFIG, source: 'default' };
}

let firebaseApp = null;
let firestoreDb = null;
let firebaseStorage = null;

export function initFirebase() {
  if (firestoreDb) {
    return { app: firebaseApp, db: firestoreDb, storage: firebaseStorage, isReady: true };
  }

  const { config } = getStoredFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, db: null, storage: null, isReady: false };
  }

  try {
    const existingApps = getApps();
    firebaseApp = existingApps.length > 0 ? existingApps[0] : initializeApp(config);
    firestoreDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
    return { app: firebaseApp, db: firestoreDb, storage: firebaseStorage, isReady: true };
  } catch (err) {
    console.warn('Firebase initialization warning:', err.message);
    return { app: null, db: null, storage: null, isReady: false, error: err.message };
  }
}

// Initial attempt
initFirebase();

export function isFirebaseReady() {
  return !!firestoreDb;
}

export function saveFirebaseConfig(configObj) {
  if (!configObj) return false;
  try {
    localStorage.setItem('nishpaksh_firebase_config', JSON.stringify(configObj));
    firestoreDb = null;
    firebaseStorage = null;
    initFirebase();
    return true;
  } catch (e) {
    console.error('Failed to save Firebase config:', e);
    return false;
  }
}

/**
 * Real-Time Case Subscription
 * Listens for changes to the 'cases' collection in Firestore.
 * When ANY person on ANY device submits a new test or verifies a case,
 * this listener immediately notifies the caller with the fresh cases list!
 */
export function subscribeToFirebaseCases(onUpdate) {
  const { db, isReady } = initFirebase();
  if (!isReady || !db) return () => {};

  try {
    const casesCollection = collection(db, 'cases');
    const unsubscribe = onSnapshot(
      casesCollection,
      (snapshot) => {
        const cloudCases = [];
        snapshot.forEach((docSnapshot) => {
          cloudCases.push({ id: docSnapshot.id, ...docSnapshot.data() });
        });
        if (typeof onUpdate === 'function') {
          onUpdate(cloudCases);
        }
      },
      (error) => {
        console.warn('Firestore subscription notice (running local vault):', error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to Firestore collection:', err);
    return () => {};
  }
}

/**
 * Save / Push Case to Cloud Firestore
 */
export async function saveCaseToFirebase(caseRecord) {
  const { db, isReady } = initFirebase();
  if (!isReady || !db || !caseRecord || !caseRecord.id) {
    return null;
  }

  try {
    const cleanRecord = { ...caseRecord };
    // Remove functions or undefined fields
    Object.keys(cleanRecord).forEach(key => {
      if (cleanRecord[key] === undefined) delete cleanRecord[key];
    });

    const caseDocRef = doc(db, 'cases', String(caseRecord.id));
    await setDoc(caseDocRef, cleanRecord, { merge: true });
    return cleanRecord;
  } catch (err) {
    console.warn('Failed to save case to Firestore:', err.message);
    return null;
  }
}

/**
 * Upload Image to Firebase Cloud Storage (optional high-res cloud backup)
 */
export async function uploadImageToFirebaseStorage(dataUrl, caseId, imageName) {
  const { storage, isReady } = initFirebase();
  if (!isReady || !storage || !dataUrl || !dataUrl.startsWith('data:')) {
    return dataUrl;
  }

  try {
    const safeCaseId = (caseId || 'CASE').replace(/[^a-zA-Z0-9_-]/g, '_');
    const imageRef = ref(storage, `cases/${safeCaseId}/${imageName}_${Date.now()}.jpg`);
    const uploadResult = await uploadString(imageRef, dataUrl, 'data_url');
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    return downloadUrl;
  } catch (err) {
    console.warn('Firebase Storage image upload notice:', err.message);
    return dataUrl; // fallback to dataUrl
  }
}
