import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let authSingleton: Auth | null = null;

// Firebase Web App configuration is public client configuration.
// Prefer build environment overrides, while retaining this project's registered
// Web App as a working default for the current Nexauren Hub deployment.
const defaultFirebaseConfig = {
  apiKey: "AIzaSyDM0CvTck9g6GW7pDmWKN0__J9TmpE7ku8",
  authDomain: "nexauren-story.firebaseapp.com",
  projectId: "nexauren-story",
  storageBucket: "nexauren-story.firebasestorage.app",
  messagingSenderId: "1062438516387",
  appId: "1:1062438516387:web:7f9726293656f8b5287116",
  measurementId: "G-QSTDEBBDMX"
};

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Authentication is available in the browser only.");
  }

  const apiKey = import.meta.env.PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const appId = import.meta.env.PUBLIC_FIREBASE_APP_ID?.trim();
  const storageBucket = import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  const messagingSenderId = import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim();

  const hasEnvironmentOverride = Boolean(apiKey || authDomain || projectId || appId);
  if (hasEnvironmentOverride && (!apiKey || !authDomain || !projectId || !appId)) {
    throw new Error("Firebase configuration is incomplete. Set PUBLIC_FIREBASE_API_KEY, PUBLIC_FIREBASE_AUTH_DOMAIN, PUBLIC_FIREBASE_PROJECT_ID and PUBLIC_FIREBASE_APP_ID together.");
  }

  const config = hasEnvironmentOverride
    ? { apiKey, authDomain, projectId, appId, storageBucket, messagingSenderId }
    : defaultFirebaseConfig;

  if (!authSingleton) {
    const app = getApps().length
      ? getApp()
      : initializeApp(config);
    authSingleton = getAuth(app);
  }

  return authSingleton;
}
