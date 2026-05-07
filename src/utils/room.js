const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode(length = 6) {
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export function normalizeRoomCode(value) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

export function getUserProfile(user) {
  return {
    uid: user.uid,
    name: user.displayName || user.email || `Guest ${user.uid.slice(0, 5)}`,
    photoURL: user.photoURL || "",
    isAnonymous: user.isAnonymous
  };
}
