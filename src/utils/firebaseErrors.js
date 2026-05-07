const firebaseErrorMessages = {
  "auth/configuration-not-found":
    "Firebase Authentication is not initialized for this project. Open Firebase Console > Authentication and click Get started.",
  "auth/operation-not-allowed":
    "This sign-in method is disabled. Enable Google and Anonymous sign-in in Firebase Authentication.",
  "auth/admin-restricted-operation":
    "Anonymous guest sign-in is blocked for this Firebase project. Enable Anonymous in Firebase Authentication > Sign-in method.",
  "auth/unauthorized-domain":
    "This domain is not authorized in Firebase. Add localhost in Authentication > Settings > Authorized domains.",
  "auth/popup-blocked": "The browser blocked the Google sign-in popup. Allow popups for this site and try again.",
  "auth/popup-closed-by-user": "The Google sign-in popup was closed before sign-in finished.",
  "auth/api-key-not-valid": "The Firebase API key in client/.env is not valid for this project.",
  "auth/invalid-api-key": "The Firebase API key in client/.env is invalid.",
  "auth/network-request-failed": "Firebase could not be reached. Check your internet connection and try again."
  ,
  "auth/email-already-in-use": "An account already exists with this email. Sign in instead.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/missing-password": "Enter your password.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/user-not-found": "No account exists for this email. Create an account first.",
  "auth/wrong-password": "Email or password is incorrect."
};

export function getReadableFirebaseError(error, fallback = "Firebase sign-in failed.") {
  const code = error?.code || error?.response?.data?.code;
  if (code && firebaseErrorMessages[code]) return firebaseErrorMessages[code];

  const message = error?.message || error?.response?.data?.message;
  if (message?.includes("CONFIGURATION_NOT_FOUND")) {
    return firebaseErrorMessages["auth/configuration-not-found"];
  }
  if (message?.includes("operation-not-allowed")) {
    return firebaseErrorMessages["auth/operation-not-allowed"];
  }
  if (message?.includes("unauthorized-domain")) {
    return firebaseErrorMessages["auth/unauthorized-domain"];
  }

  return message || fallback;
}
