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
      .catch(() => toast.error("Room will be created when you connect."));
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
        created.emit("join-room", { roomCode, user: profile });
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
      created.on("connect_error", (error) => toast.error(error.message || "Socket connection failed."));
    });

    return () => {
      alive = false;
      nextSocket?.disconnect();
    };
  }, [roomCode, profile.uid]);

  useEffect(() => {
    if (!socket || !canControlPlayback) return;
    const interval = window.setInterval(() => {
      socket.emit("sync-state", {
        roomCode,
        timestamp: playerRef.current?.getCurrentTime?.() || playback.timestamp,
        isPlaying: playback.isPlaying
      });
    }, 4000);
    return () => window.clearInterval(interval);
  }, [socket, canControlPlayback, roomCode, playback.isPlaying, playback.timestamp]);

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

  function addToQueue(video) {
    if (!currentVideo && !canControlPlayback) {
      toast.error("Ask the host for playback permission to start a video.");
      return;
    }
    socket?.emit("queue-update", { roomCode, action: "add", video });
    toast.success(currentVideo ? "Added to queue." : "Starting video.");
  }

  function removeFromQueue(index) {
    if (!canControlPlayback) {
      toast.error("The host has not allowed you to manage playback.");
      return;
    }
    socket?.emit("queue-update", { roomCode, action: "remove", index });
  }

  function playNext() {
    if (!canControlPlayback) {
      toast.error("The host has not allowed you to control playback.");
      return;
    }
    socket?.emit("queue-update", { roomCode, action: "next" });
  }

  function updatePlaybackPermission(targetUid, allowed) {
    if (!isHost) return;
    socket?.emit("update-playback-permission", { roomCode, targetUid, allowed });
  }

  return (
    <main className="min-h-screen bg-ink p-3 text-zinc-50 lg:p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand font-black text-zinc-950">Y</div>
          <div>
            <h1 className="text-xl font-black">Ystream</h1>
            <p className="flex items-center gap-2 text-sm text-muted">
              {connected ? <Wifi size={15} className="text-brand" /> : <WifiOff size={15} className="text-red-400" />}
              {connected ? "Live sync connected" : "Reconnecting"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" onClick={() => navigate("/")}>
            <LogOut size={18} /> Leave
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-4">
          <YouTubePlayer
            currentVideo={currentVideo}
            playback={playback}
            canControl={canControlPlayback}
            onLocalEvent={emitPlayback}
            onNext={playNext}
            onPlayerReady={(player) => {
              playerRef.current = player;
            }}
          />
          {!canControlPlayback && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-muted">
              The host has not allowed you to control playback. You can still search and add videos to the queue after playback starts.
            </div>
          )}
          <SearchPanel hasCurrentVideo={Boolean(currentVideo)} onAdd={addToQueue} />
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
    </main>
  );
}
