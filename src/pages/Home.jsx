import { LogIn, Plus, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getBackendConfigMessage } from "../lib/config.js";
import { createRoom } from "../lib/api.js";
import { logout } from "../lib/firebase.js";
import { getReadableFirebaseError } from "../utils/firebaseErrors.js";
import { generateRoomCode, normalizeRoomCode } from "../utils/room.js";

export default function Home() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  const [busy, setBusy] = useState(false);
  const previewCode = useMemo(() => generateRoomCode(), []);

  async function handleCreate() {
    setBusy(true);
    try {
      const { data } = await createRoom();
      navigate(`/room/${data.room.code}`);
    } catch (error) {
      toast.error(error.response?.data?.message || getReadableFirebaseError(error, getBackendConfigMessage()));
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(event) {
    event.preventDefault();
    const code = normalizeRoomCode(roomCode);
    if (!code) {
      toast.error("Enter a room code.");
      return;
    }
    setBusy(true);
    try {
      navigate(`/room/${code}`);
    } catch (error) {
      toast.error(getReadableFirebaseError(error, "Could not join room."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink px-4 py-5 text-zinc-50 sm:px-6 lg:px-10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand font-black text-zinc-950">Y</div>
          <div>
            <p className="text-xl font-black tracking-tight">Ystream</p>
            <p className="text-xs text-muted">Synchronized YouTube rooms</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <Button
              variant="ghost"
              onClick={async () => {
                await logout();
                navigate("/auth");
              }}
            >
              Sign out
            </Button>
          )}
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="inline-flex rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm text-brand">
              Watch together, stay perfectly in sync
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-normal sm:text-6xl xl:text-7xl">
              Ystream
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-300">
              Create a private room, search YouTube inside the app, queue videos, chat, react, and keep every screen locked to the same moment.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-sm text-zinc-300">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-2xl font-black text-white">Live</p>
              <p>Socket sync</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-2xl font-black text-white">API</p>
              <p>YouTube search</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-2xl font-black text-white">Auth</p>
              <p>Firebase</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-panel p-4 shadow-glow sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">Start a room</h2>
              <p className="text-sm text-muted">Signed in as {user?.displayName || user?.email || "Guest"}</p>
            </div>
            <Shuffle className="text-brand" />
          </div>

          <form className="space-y-3" onSubmit={handleJoin}>
            <input
              className="h-14 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-lg font-bold uppercase tracking-[0.2em] text-white outline-none transition placeholder:normal-case placeholder:tracking-normal focus:border-brand"
              placeholder="Enter room code"
              value={roomCode}
              onChange={(event) => setRoomCode(normalizeRoomCode(event.target.value))}
            />
            <Button className="w-full" disabled={busy || loading} type="submit">
              <LogIn size={18} /> Join Room
            </Button>
            <Button className="w-full" disabled={busy || loading} type="button" variant="danger" onClick={handleCreate}>
              <Plus size={18} /> Create Room
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted">Try a random code format like {previewCode}</p>
        </div>
      </section>
    </main>
  );
}
