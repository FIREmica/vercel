// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Handled as an environment variable
  authDomain: "account-lockout-analyzer.firebaseapp.com",
  projectId: "account-lockout-analyzer",
  storageBucket: "account-lockout-analyzer.appspot.com", // Corrected from firebasestorage.app
  messagingSenderId: "1005710075157",
  appId: "1:1005710075157:web:76b8139a68b55d29e7351c",
  measurementId: "G-1G50JX55C9"
};

// Initialize Firebase
let app: FirebaseApp;
let analytics: Analytics | null = null;

if (typeof window !== 'undefined') { // Ensure Firebase is initialized only on the client-side
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  if (app.name && typeof window !== 'undefined' && firebaseConfig.measurementId) {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.error("Failed to initialize Firebase Analytics:", error);
      // Potentially handle the error, e.g. by not trying to log events
    }
  }
} else {
  // For server-side, we might not need to initialize app here unless specifically for admin tasks
  // but this client.ts is primarily for client-side initialization.
  // If you were to initialize on server, you'd check getApps().length too.
}


export { app, analytics };
