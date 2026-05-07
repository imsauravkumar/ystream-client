import { io } from "socket.io-client";
import { auth } from "./firebase";

export async function createSocket() {
  const token = await auth.currentUser?.getIdToken();

  return io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
    transports: ["websocket", "polling"],
    auth: { token },
    reconnectionAttempts: 10,
    reconnectionDelay: 700
  });
}
