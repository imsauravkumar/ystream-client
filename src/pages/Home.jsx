import { Hash, ListMusic, LogIn, LogOut, MessageCircle, PlayCircle, Plus, Radio, Shuffle, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import BrandMark from "../components/BrandMark.jsx";
import Button from "../components/Button.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import CopyrightBadge from "../components/CopyrightBadge.jsx";
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
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
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

  async function confirmSignOut() {
    await logout();
    navigate("/auth");
  }

  return (
    <main className="min-h-screen bg-ink px-4 py-5 text-zinc-50 sm:px-6 lg:px-10">
      <nav className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-zinc-800/80 bg-panel/80 px-2.5 py-2.5 shadow-glow backdrop-blur sm:gap-3 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <BrandMark className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
          <div className="min-w-0">
            <p className="truncate text-xl font-black leading-6 tracking-normal sm:text-2xl sm:leading-7">Ystream</p>
            <p className="truncate text-xs leading-4 text-muted sm:text-sm sm:leading-5">Synchronized YouTube rooms</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {user && (
            <Button
              className="h-11 w-11 whitespace-nowrap px-0 sm:w-auto sm:min-w-[6.5rem] sm:px-4"
              variant="ghost"
              title="Sign out"
              onClick={() => setSignOutDialogOpen(true)}
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          )}
        </div>
      </nav>

      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col justify-center gap-5 py-8">
        <div className="rounded-xl border border-zinc-800 bg-panel/90 p-5 shadow-glow sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-2">
              <p className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm text-brand">
                <Radio size={15} />
                Live watch rooms
              </p>
              <h1 className="text-3xl font-black leading-tight tracking-normal sm:text-4xl">Create your room</h1>
              <p className="max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
                Start a private watch room, then share the room code with friends so everyone joins the same synced player.
              </p>
            </div>
            <Button className="h-12 w-full px-5 sm:w-auto sm:shrink-0" disabled={busy || loading} type="button" onClick={handleCreate}>
              <Plus size={18} /> Create Room
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-panel p-4 shadow-glow sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl font-black">Join a room</h2>
              <p className="truncate text-sm text-muted">{user?.displayName || user?.email || "Guest"}</p>
            </div>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
              <Shuffle size={20} />
            </div>
          </div>

          <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleJoin}>
            <div className="min-w-0">
              <label className="mb-2 block text-sm font-semibold text-zinc-300" htmlFor="room-code">
                Room code
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  id="room-code"
                  className="h-14 w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-11 pr-4 text-lg font-bold uppercase tracking-[0.2em] text-white outline-none transition placeholder:normal-case placeholder:tracking-normal focus:border-brand"
                  placeholder={previewCode}
                  value={roomCode}
                  onChange={(event) => setRoomCode(normalizeRoomCode(event.target.value))}
                />
              </div>
            </div>
            <Button className="h-14 w-full self-end px-6 lg:w-auto" disabled={busy || loading} type="submit">
              <LogIn size={18} /> Join Room
            </Button>
          </form>
          <p className="mt-4 text-sm leading-5 text-muted">Paste the code your friend shared to enter their room.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand">
              <UsersRound size={20} />
            </div>
            <p className="font-bold text-white">Private rooms</p>
            <p className="mt-1 text-sm leading-5 text-muted">Share one code with the people you choose.</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand">
              <ListMusic size={20} />
            </div>
            <p className="font-bold text-white">Shared queue</p>
            <p className="mt-1 text-sm leading-5 text-muted">Add songs and keep the session moving smoothly.</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand">
              <MessageCircle size={20} />
            </div>
            <p className="font-bold text-white">Room chat</p>
            <p className="mt-1 text-sm leading-5 text-muted">React and talk without leaving the player.</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-panel/80 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-zinc-950 text-brand">
              <PlayCircle size={22} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white">Rooms open directly into the synced player.</p>
              <p className="text-sm text-muted">Search YouTube, manage playback permission, and switch songs from inside the room.</p>
            </div>
          </div>
        </div>
      </section>
      <CopyrightBadge />
      <ConfirmDialog
        open={signOutDialogOpen}
        title="Sign out?"
        message="You will leave your dashboard and return to the sign-in screen."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        onCancel={() => setSignOutDialogOpen(false)}
        onConfirm={confirmSignOut}
      />
    </main>
  );
}
