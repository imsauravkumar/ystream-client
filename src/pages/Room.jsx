import { LogOut, Wifi, WifiOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button.jsx";
import SearchPanel from "../components/SearchPanel.jsx";
import Sidebar from "../components/Sidebar.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import YouTubePlayer from "../components/YouTubePlayer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getBackendConfigMessage } from "../lib/config.js";
import { getRoom } from "../lib/api.js";
import { createSocket } from "../lib/socket.js";
import { getUserProfile } from "../utils/room.js";

export default function Room() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [users, setUsers] = useState([]);
  const [queue, setQueue] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState([]);
  const [playback, setPlayback] = useState({ isPlaying: false, timestamp: 0, updatedAt: new Date().toISOString() });
  const [currentVideo, setCurrentVideo] = useState(null);
  const [queueActionPending, setQueueActionPending] = useState(false);
  const playerRef = useRef(null);
  const profile = useMemo(() => getUserProfile(user), [user]);
  const isHost = room?.hostUid === user?.uid;
  const canControlPlayback = isHost || room?.playbackControllerUids?.includes(user?.uid);

  useEffect(() => {
    let alive = true;
    getRoom(roomCode)
      .then(({ data }) => {
        if (!alive) return;
        setRoom(data.room);
        setQueue(data.room.queue || []);
        setPlayback(data.room.playback || playback);
        setCurrentVideo(data.room.currentVideo || null);
      })
      .catch((error) => toast.error(error.response?.data?.message || getBackendConfigMessage()));
    return () => {
      alive = false;
    };
  }, [roomCode]);

  useEffect(() => {
    let nextSocket;
    let alive = true;

    createSocket().then((created) => {
      if (!alive) {
        created.disconnect();
        return;
      }
      nextSocket = created;
      setSocket(created);

      created.on("connect", () => {
        setConnected(true);
        created.timeout(7000).emit("join-room", { roomCode, user: profile }, (error, response) => {
          if (error) {
            toast.error("Room join timed out. Check the Railway backend logs and URL.");
            return;
          }
          if (!response?.ok) {
            toast.error(response?.message || "Could not join room.");
          }
        });
      });
      created.on("disconnect", () => setConnected(false));
      created.on("room-state", (state) => {
        setRoom(state.room);
        setUsers(state.users);
        setQueue(state.room.queue || []);
        setPlayback(state.room.playback);
        setCurrentVideo(state.room.currentVideo);
      });
      created.on("users-update", setUsers);
      created.on("queue-update", setQueue);
      created.on("sync-state", ({ playback: nextPlayback, currentVideo: nextVideo }) => {
        setPlayback(nextPlayback);
        setCurrentVideo(nextVideo);
      });
      created.on("chat-message", (message) => setMessages((items) => [...items.slice(-80), message]));
      created.on("typing", setTyping);
      created.on("reaction", ({ user: reactionUser, emoji }) => toast(`${reactionUser.name} reacted ${emoji}`));
      created.on("error-message", (message) => toast.error(message));
      created.on("connect_error", (error) => toast.error(error?.message || getBackendConfigMessage()));
    });

    return () => {
      alive = false;
      nextSocket?.disconnect();
    };
  }, [roomCode, profile.uid]);

  useEffect(() => {
    if (!socket || !isHost) return;
    const interval = window.setInterval(() => {
      const timestamp = playerRef.current?.getCurrentTime?.();
      socket.emit("sync-state", {
        roomCode,
        timestamp: Number.isFinite(Number(timestamp)) ? timestamp : playback.timestamp,
        isPlaying: playback.isPlaying
      });
    }, 5000);
    return () => window.clearInterval(interval);
  }, [socket, isHost, roomCode, playback.isPlaying, playback.timestamp]);

  useEffect(() => {
    function confirmBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", confirmBeforeUnload);
    return () => window.removeEventListener("beforeunload", confirmBeforeUnload);
  }, []);

  const emitPlayback = useCallback(
    (eventName, payload = {}) => {
      if (!socket || !canControlPlayback) {
        toast.error("The host has not allowed you to control playback.");
        return;
      }
      socket.emit(eventName, { roomCode, ...payload });
    },
    [socket, canControlPlayback, roomCode]
  );

  const emitQueueUpdate = useCallback(
    (payload) =>
      new Promise((resolve, reject) => {
        if (!socket?.connected) {
          reject(new Error("Room connection is not ready yet. Please try again."));
          return;
        }

        socket.timeout(7000).emit("queue-update", { roomCode, ...payload }, (error, response) => {
          if (error) {
            reject(new Error("Room server connection failed. Check your backend URL."));
            return;
          }

          if (!response?.ok) {
            reject(new Error(response?.message || "Queue update failed."));
            return;
          }

          resolve(response);
        });
      }),
    [socket, roomCode]
  );

  async function addToQueue(video) {
    if (!canControlPlayback) {
      toast.error("The host has not allowed you to add or play songs.");
      return;
    }
    if (queueActionPending) return;

    setQueueActionPending(true);
    try {
      const response = await emitQueueUpdate({ action: "add", video });
      setQueue(response.queue || []);
      setPlayback(response.playback || playback);
      setCurrentVideo(response.currentVideo || null);
      toast.success(currentVideo ? "Added to queue." : "Starting video.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setQueueActionPending(false);
    }
  }

  async function removeFromQueue(index) {
    if (!canControlPlayback) {
      toast.error("The host has not allowed you to manage playback.");
      return;
    }
    if (queueActionPending) return;

    setQueueActionPending(true);
    try {
      const response = await emitQueueUpdate({ action: "remove", index });
      setQueue(response.queue || []);
      setPlayback(response.playback || playback);
      setCurrentVideo(response.currentVideo || null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setQueueActionPending(false);
    }
  }

  async function playNext() {
    if (!canControlPlayback) {
      toast.error("The host has not allowed you to control playback.");
      return;
    }
    if (queueActionPending) return;

    setQueueActionPending(true);
    try {
      const response = await emitQueueUpdate({ action: "next" });
      setQueue(response.queue || []);
      setPlayback(response.playback || playback);
      setCurrentVideo(response.currentVideo || null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setQueueActionPending(false);
    }
  }

  async function playPrevious() {
    if (!canControlPlayback) {
      toast.error("The host has not allowed you to control playback.");
      return;
    }
    if (queueActionPending) return;

    setQueueActionPending(true);
    try {
      const response = await emitQueueUpdate({ action: "previous" });
      setQueue(response.queue || []);
      setPlayback(response.playback || playback);
      setCurrentVideo(response.currentVideo || null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setQueueActionPending(false);
    }
  }

  function updatePlaybackPermission(targetUid, allowed) {
    if (!isHost) return;
    socket?.emit("update-playback-permission", { roomCode, targetUid, allowed });
  }

  function leaveRoom() {
    const shouldLeave = window.confirm("Are you sure you want to leave this room?");
    if (shouldLeave) navigate("/");
  }

  return (
    <main className="min-h-screen bg-ink px-3 py-4 text-zinc-50 sm:px-4 lg:px-6">
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-panel/90 px-4 py-3 shadow-glow backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand font-black text-zinc-950">Y</div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="text-xl font-black leading-tight">Ystream</h1>
                <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs font-bold tracking-[0.18em] text-zinc-200">
                  {room?.code || roomCode}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                {connected ? <Wifi size={15} className="text-brand" /> : <WifiOff size={15} className="text-red-400" />}
                {connected ? "Live sync connected" : "Reconnecting"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={leaveRoom}>
              <LogOut size={18} /> Leave
            </Button>
          </div>
        </header>

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0 space-y-4">
            <YouTubePlayer
              currentVideo={currentVideo}
              playback={playback}
              canControl={canControlPlayback}
              canAutoAdvance={isHost}
              onLocalEvent={emitPlayback}
              onPrevious={playPrevious}
              onNext={playNext}
              onPlayerReady={(player) => {
                playerRef.current = player;
              }}
            />
            {!canControlPlayback && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-muted">
                The host has not allowed you to add, play, or control songs yet.
              </div>
            )}
            <SearchPanel hasCurrentVideo={Boolean(currentVideo)} adding={queueActionPending} canAdd={canControlPlayback} onAdd={addToQueue} />
          </div>

          <Sidebar
            room={room}
            currentUserUid={user?.uid}
            isHost={isHost}
            users={users}
            queue={queue}
            messages={messages}
            typingUsers={typing.filter((name) => name !== profile.name)}
            onSendMessage={(text) => socket?.emit("chat-message", { roomCode, text })}
            onTyping={(isTyping) => socket?.emit("typing", { roomCode, isTyping })}
            onReaction={(emoji) => socket?.emit("reaction", { roomCode, emoji })}
            onRemoveFromQueue={removeFromQueue}
            onUpdatePlaybackPermission={updatePlaybackPermission}
          />
        </div>
      </div>
    </main>
  );
}
