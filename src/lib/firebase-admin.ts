import admin from "firebase-admin";
import { initializeFirestore, getFirestore, Firestore } from "firebase-admin/firestore";

let isInitialized = false;
let initError: string | null = null;
let firestoreDb: Firestore | null = null;

function initFirebase() {
  if (isInitialized) return;
  
  try {
    if (!admin.apps.length) {
      if (!process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error("FIREBASE_PRIVATE_KEY is completely missing from Netlify Environment Variables! Please add it in Site Settings and redeploy.");
      }
      
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
        privateKey = privateKey.slice(1, -1);
      }
      privateKey = privateKey.replace(/\\n/g, "\n");

      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "yourinnovator-79f99";
      const app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
      });

      firestoreDb = initializeFirestore(app, {
        preferRest: true
      });
    } else {
      const app = admin.apps[0];
      if (app) {
        firestoreDb = getFirestore(app);
      }
    }
    isInitialized = true;
  } catch (e: any) {
    initError = e.message;
    isInitialized = true;
  }
}

export function ensureFirebaseAdmin() {
  initFirebase();
  if (initError) throw new Error(initError);
}

export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get: (target, prop) => {
    initFirebase();
    if (initError) throw new Error(initError);
    if (!firestoreDb) throw new Error("Firestore was not initialized");
    return (firestoreDb as any)[prop];
  }
});
