import axios from "axios";
import { auth } from "./firebase";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
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
