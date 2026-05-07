import { Crown, KeyRound, Link2, Send, ShieldCheck, Smile, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Avatar from "./Avatar.jsx";
import Button from "./Button.jsx";

export default function Sidebar({
  room,
  currentUserUid,
  isHost,
  users,
  queue,
  messages,
  typingUsers,
  onSendMessage,
  onTyping,
  onReaction,
  onRemoveFromQueue,
  onUpdatePlaybackPermission
}) {
  const [message, setMessage] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function shareRoom() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Room link copied.");
  }

  function send(event) {
    event.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage("");
  }

  function hasPlaybackPermission(user) {
    return user.uid === room?.hostUid || room?.playbackControllerUids?.includes(user.uid);
  }

  return (
    <aside className="grid gap-4 lg:max-h-[calc(100vh-2rem)] lg:grid-rows-[auto_auto_1fr]">
      <section className="rounded-xl border border-zinc-800 bg-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-muted">Room</p>
            <h2 className="text-2xl font-black tracking-[0.18em]">{room?.code}</h2>
          </div>
          <Button variant="ghost" onClick={shareRoom} title="Copy room link">
            <Link2 size={18} />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Users size={16} className="text-brand" /> {users.length} connected
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-black">Queue</h3>
          <span className="text-sm text-muted">{queue.length}</span>
        </div>
        <div className="scrollbar-soft max-h-72 space-y-2 overflow-auto pr-1">
          {queue.length === 0 && <p className="text-sm text-muted">No videos queued yet.</p>}
          {queue.map((video, index) => (
            <div key={`${video.videoId}-${index}`} className="flex gap-2 rounded-lg bg-zinc-950 p-2">
              <img className="h-14 w-20 rounded object-cover" src={video.thumbnail} alt="" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-bold">{video.title}</p>
                <button className="mt-1 text-xs text-red-400 hover:text-red-300" onClick={() => onRemoveFromQueue(index)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid min-h-[28rem] grid-rows-[auto_auto_1fr_auto] rounded-xl border border-zinc-800 bg-panel p-4">
        <h3 className="mb-3 font-black">People</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {users.map((user) => (
            <div key={user.uid} className="flex items-center gap-2 rounded-full bg-zinc-950 px-2 py-1 text-xs">
              <Avatar user={user} size="sm" />
              <span className="max-w-24 truncate">{user.name}</span>
              {room?.hostUid === user.uid && <Crown size={14} className="text-brand" />}
              {hasPlaybackPermission(user) && room?.hostUid !== user.uid && <ShieldCheck size={14} className="text-brand" />}
              {isHost && user.uid !== currentUserUid && (
                <button
                  className={`ml-1 rounded-full px-2 py-1 text-[11px] font-bold transition ${
                    hasPlaybackPermission(user) ? "bg-red-950 text-red-300 hover:bg-red-900" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                  }`}
                  onClick={() => onUpdatePlaybackPermission(user.uid, !hasPlaybackPermission(user))}
                  type="button"
                >
                  <KeyRound className="mr-1 inline" size={12} />
                  {hasPlaybackPermission(user) ? "Revoke" : "Allow"}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="scrollbar-soft min-h-0 space-y-3 overflow-auto pr-1">
          {messages.map((item) => (
            <div key={item.id} className="flex gap-2">
              <Avatar user={item.user} size="sm" />
              <div className="min-w-0 rounded-lg bg-zinc-950 px-3 py-2">
                <p className="text-xs font-bold text-zinc-300">{item.user.name}</p>
                <p className="break-words text-sm">{item.text}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="mt-3 min-h-5 text-xs text-muted">{typingUsers.length ? `${typingUsers.join(", ")} typing...` : ""}</div>

        <form className="mt-2 flex gap-2" onSubmit={send}>
          <button className="grid h-11 w-11 place-items-center rounded-lg bg-zinc-900 hover:bg-zinc-800" type="button" onClick={() => onReaction("🔥")} title="React">
            <Smile size={18} />
          </button>
          <input
            className="h-11 min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 outline-none focus:border-brand"
            placeholder="Message"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              onTyping(Boolean(event.target.value));
            }}
          />
          <button className="grid h-11 w-11 place-items-center rounded-lg bg-brand text-zinc-950 hover:bg-green-400" type="submit" title="Send">
            <Send size={18} />
          </button>
        </form>
      </section>
    </aside>
  );
}
