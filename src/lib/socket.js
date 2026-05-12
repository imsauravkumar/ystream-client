import { io } from "socket.io-client";
import { auth } from "./firebase";
import { getBackendUrl } from "./config";

export async function createSocket() {
  const token = await auth.currentUser?.getIdToken();

  return io(getBackendUrl(), {
    transports: ["polling", "websocket"],
    upgrade: true,
    auth: { token },
    reconnectionAttempts: 10,
    reconnectionDelay: 700
  });
}
