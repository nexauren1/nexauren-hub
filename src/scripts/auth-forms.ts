import {
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  updateProfile,
  verifyPasswordResetCode
} from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase-client";

function msg(root: ParentNode, text: string, error = false) {
  const el = root.querySelector<HTMLElement>("[data-auth-message]");
  if (!el) return;
  el.hidden = false;
  el.textContent = text;
  el.classList.toggle("is-error", error);
  el.classList.toggle("is-success", !error);
}

function auth(root: ParentNode) {
  try {
    return getFirebaseAuth();
  } catch (error) {
    msg(root, error instanceof Error ? error.message : "Account services are not configured.", true);
    return null;
  }
}

function friendlyError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "An account already exists for this email. Try logging in instead.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/user-not-found": "The email or password is incorrect.",
    "auth/wrong-password": "The email or password is incorrect.",
    "auth/weak-password": "Choose a stronger password with at least 8 characters.",
    "auth/too-many-requests": "Too many attempts. Wait a little and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/unauthorized-domain": "This domain is not authorized in Firebase Authentication settings.",
    "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase Console.",
    "auth/expired-action-code": "This link has expired. Request a new email.",
    "auth/invalid-action-code": "This link is invalid or has already been used."
  };
  return messages[code] || (error instanceof Error ? error.message : "The request could not be completed. Please try again.");
}

function busy(button: HTMLButtonElement | null, on: boolean, label: string) {
  if (!button) return;
  if (!button.dataset.originalLabel) button.dataset.originalLabel = button.textContent || "Continue";
  button.disabled = on;
  button.textContent = on ? label : button.dataset.originalLabel;
}

const callbackUrl = () => new URL("/auth/callback/", location.origin).toString();
const resetUrl = () => new URL("/reset-password/", location.origin).toString();

document.querySelectorAll<HTMLFormElement>("[data-auth-form]").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const firebaseAuth = auth(form);
    if (!firebaseAuth) return;

    const data = new FormData(form);
    const action = form.dataset.authForm || "";
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const label = action === "register" ? "Creating account…" : action === "login" ? "Signing in…" : action === "forgot" ? "Sending recovery email…" : "Updating password…";
    busy(button, true, label);

    try {
      if (action === "register") {
        if (password.length < 8) throw new Error("Use a password with at least 8 characters.");
        const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const fullName = String(data.get("full_name") || "").trim();
        if (fullName) await updateProfile(result.user, { displayName: fullName });
        await sendEmailVerification(result.user, { url: callbackUrl() });
        await signOut(firebaseAuth);
        msg(form, "Account created. Check your inbox and verify your email before logging in.");
      } else if (action === "login") {
        const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
        if (!result.user.emailVerified) {
          await signOut(firebaseAuth);
          throw new Error("Please verify your email using the link we sent before logging in.");
        }
        location.assign("/dashboard/");
      } else if (action === "forgot") {
        await sendPasswordResetEmail(firebaseAuth, email, { url: resetUrl() });
        msg(form, "If that email is registered, a password recovery email will be sent. Check your inbox.");
      } else if (action === "update-password") {
        if (password.length < 8) throw new Error("Use a password with at least 8 characters.");
        if (password !== String(data.get("confirm_password") || "")) throw new Error("The passwords do not match.");
        const code = new URLSearchParams(location.search).get("oobCode");
        if (!code) throw new Error("This recovery link is missing or invalid. Request a new one.");
        await confirmPasswordReset(firebaseAuth, code, password);
        msg(form, "Password updated. You can now log in with your new password.");
        window.setTimeout(() => location.assign("/login/"), 1400);
      }
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      if (action === "forgot" && code === "auth/user-not-found") {
        msg(form, "If that email is registered, a password recovery email will be sent. Check your inbox.");
      } else {
        msg(form, friendlyError(error), true);
      }
    } finally {
      busy(button, false, label);
    }
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-google-auth]").forEach((button) => {
  button.addEventListener("click", async () => {
    const root = button.closest("section") || document;
    const firebaseAuth = auth(root);
    if (!firebaseAuth) return;
    busy(button, true, "Connecting to Google…");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithRedirect(firebaseAuth, provider);
    } catch (error) {
      msg(root, friendlyError(error), true);
      busy(button, false, "Continue with Google");
    }
  });
});

const authPage = document.querySelector<HTMLElement>(".auth-card [data-auth-form], .auth-card [data-google-auth]")?.closest<HTMLElement>(".auth-card") || document.querySelector<HTMLElement>("[data-auth-form]");
if (authPage) {
  const firebaseAuth = auth(authPage);
  if (firebaseAuth) {
    void getRedirectResult(firebaseAuth).then((result) => {
      if (!result) return;
      if (!result.user.emailVerified) {
        msg(authPage, "Please verify your email before continuing.", true);
        void signOut(firebaseAuth);
        return;
      }
      location.replace("/dashboard/");
    }).catch((error) => msg(authPage, friendlyError(error), true));
  }
}

const callback = document.querySelector<HTMLElement>("[data-auth-callback]");
if (callback) {
  void (async () => {
    const firebaseAuth = auth(callback);
    if (!firebaseAuth) return;
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    const code = params.get("oobCode");
    try {
      if (mode === "verifyEmail" && code) {
        await applyActionCode(firebaseAuth, code);
        msg(callback, "Email verified successfully. You can now log in.");
        return;
      }
      // Firebase uses one custom action-handler URL across email templates.
      // Route password reset action codes to the existing reset form.
      if (mode === "resetPassword" && code) {
        const next = new URL("/reset-password/", location.origin);
        for (const key of ["mode", "oobCode", "apiKey", "continueUrl", "lang"]) {
          const value = key === "mode" ? mode : params.get(key);
          if (value) next.searchParams.set(key, value);
        }
        location.replace(next.toString());
        return;
      }
      const result = await getRedirectResult(firebaseAuth);
      if (result?.user) {
        location.replace("/dashboard/");
        return;
      }
      msg(callback, "This sign-in link is not valid or has expired. Return to login and try again.", true);
    } catch (error) {
      msg(callback, friendlyError(error), true);
    }
  })();
}

const reset = document.querySelector<HTMLElement>("[data-password-reset-root]");
if (reset) {
  void (async () => {
    const firebaseAuth = auth(reset);
    if (!firebaseAuth) return;
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    const code = params.get("oobCode");
    try {
      if (mode !== "resetPassword" || !code) throw new Error("This recovery link is invalid or expired. Request a new one.");
      await verifyPasswordResetCode(firebaseAuth, code);
      const wrap = reset.querySelector<HTMLElement>("[data-reset-form-wrap]");
      if (wrap) wrap.hidden = false;
      const loading = reset.querySelector<HTMLElement>("[data-reset-loading]");
      if (loading) loading.hidden = true;
      const status = reset.querySelector<HTMLElement>("[data-auth-message]");
      if (status) status.hidden = true;
    } catch (error) {
      const loading = reset.querySelector<HTMLElement>("[data-reset-loading]");
      if (loading) loading.hidden = true;
      msg(reset, friendlyError(error), true);
    }
  })();
}

const dashboard = document.querySelector<HTMLElement>("[data-auth-dashboard]");
if (dashboard) {
  const firebaseAuth = auth(dashboard);
  if (firebaseAuth) {
    void import("firebase/auth").then(({ onAuthStateChanged }) => {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        if (!user) {
          unsubscribe();
          location.replace("/login/");
          return;
        }
        const name = dashboard.querySelector<HTMLElement>("[data-user-name]");
        const email = dashboard.querySelector<HTMLElement>("[data-user-email]");
        if (name) name.textContent = user.displayName || user.email?.split("@")[0] || "there";
        if (email) email.textContent = user.email || "";
        dashboard.querySelectorAll<HTMLElement>("[data-auth-loading]").forEach((element) => { element.hidden = true; });
        dashboard.querySelectorAll<HTMLElement>("[data-auth-loaded]").forEach((element) => { element.hidden = false; });
      });
    }).catch((error) => msg(dashboard, friendlyError(error), true));
  }
  dashboard.querySelectorAll<HTMLButtonElement>("[data-sign-out]").forEach((button) => {
    button.addEventListener("click", async () => {
      const firebaseAuth = auth(dashboard);
      if (!firebaseAuth) return;
      try {
        await signOut(firebaseAuth);
        location.replace("/login/");
      } catch (error) {
        msg(dashboard, friendlyError(error), true);
      }
    });
  });
}
