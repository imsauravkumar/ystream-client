import axios from "axios";
import { auth } from "./firebase";
import { getBackendUrl } from "./config";

export const api = axios.create({
  baseURL: getBackendUrl(),
  timeout: 15000
});

api.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function searchVideos(query) {
  return api.get("/api/youtube/search", { params: { q: query } });
}

export function getRoom(roomCode) {
  return api.get(`/api/rooms/${roomCode}`);
}

export function createRoom() {
  return api.post("/api/rooms");
}
