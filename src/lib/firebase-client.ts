import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let authSingleton: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Authentication is available in the browser only.");
  }

  const apiKey = import.meta.env.PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const appId = import.meta.env.PUBLIC_FIREBASE_APP_ID?.trim();

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error("Account access is not configured yet. Add the Firebase web app settings to the Cloudflare Pages environment variables.");
  }

  if (!authSingleton) {
    const app = getApps().length
      ? getApp()
      : initializeApp({
          apiKey,
          authDomain,
          projectId,
          appId,
          storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || undefined,
          messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || undefined
        });
    authSingleton = getAuth(app);
  }

  return authSingleton;
}
