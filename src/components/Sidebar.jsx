import { Crown, KeyRound, Send, ShieldCheck, Smile, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar.jsx";

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
  const messagesRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    const messagesElement = messagesRef.current;
    if (!messagesElement) return;
    messagesElement.scrollTop = messagesElement.scrollHeight;
  }, [messages.length]);

  function send(event) {
    event.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message.trim());
    onTyping(false);
    setMessage("");
  }

  function hasPlaybackPermission(user) {
    return user.uid === room?.hostUid || room?.playbackControllerUids?.includes(user.uid);
  }

  return (
    <aside className="grid gap-4 xl:max-h-[calc(100vh-7rem)] xl:grid-rows-[auto_auto_auto_1fr]">
      <section className="rounded-xl border border-zinc-800 bg-panel/90 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Room</p>
          <h2 className="mt-1 text-2xl font-black tracking-[0.18em]">{room?.code || "------"}</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-zinc-950/80 p-3">
            <p className="text-xs text-muted">Connected</p>
            <p className="mt-1 flex items-center gap-2 text-lg font-black">
              <Users size={16} className="text-brand" /> {users.length}
            </p>
          </div>
          <div className="rounded-lg bg-zinc-950/80 p-3">
            <p className="text-xs text-muted">Queue</p>
            <p className="mt-1 text-lg font-black">{queue.length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-panel/90 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-black">People</h3>
          {isHost && <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">Host controls</span>}
        </div>
        <div className="scrollbar-soft max-h-52 space-y-2 overflow-auto pr-1">
          {users.map((user) => (
            <div key={user.uid} className="flex items-center gap-3 rounded-lg bg-zinc-950/80 p-2">
              <Avatar user={user} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{user.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  {room?.hostUid === user.uid ? (
                    <>
                      <Crown size={13} className="text-brand" /> Host
                    </>
                  ) : hasPlaybackPermission(user) ? (
                    <>
                      <ShieldCheck size={13} className="text-brand" /> Can control
                    </>
                  ) : (
                    "Listening"
                  )}
                </p>
              </div>
              {isHost && user.uid !== currentUserUid && (
                <button
                  className={`shrink-0 rounded-lg px-2.5 py-2 text-xs font-bold transition ${
                    hasPlaybackPermission(user) ? "bg-red-950/80 text-red-300 hover:bg-red-900" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                  }`}
                  onClick={() => onUpdatePlaybackPermission(user.uid, !hasPlaybackPermission(user))}
                  type="button"
                >
                  <KeyRound className="mr-1 inline" size={13} />
                  {hasPlaybackPermission(user) ? "Revoke" : "Allow"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-panel/90 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-black">Up Next</h3>
          <span className="text-sm text-muted">{queue.length}</span>
        </div>
        <div className="scrollbar-soft max-h-72 space-y-2 overflow-auto pr-1">
          {queue.length === 0 && <p className="rounded-lg bg-zinc-950/70 p-3 text-sm text-muted">No videos queued yet.</p>}
          {queue.map((video, index) => (
            <div key={`${video.videoId}-${index}`} className="flex gap-3 rounded-lg bg-zinc-950/80 p-2">
              <img className="h-14 w-20 rounded-md object-cover" src={video.thumbnail} alt="" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-bold leading-snug">{video.title}</p>
                <button className="mt-1 text-xs font-bold text-red-400 transition hover:text-red-300" onClick={() => onRemoveFromQueue(index)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid min-h-[28rem] grid-rows-[auto_1fr_auto_auto] rounded-xl border border-zinc-800 bg-panel/90 p-4">
        <h3 className="mb-3 font-black">Chat</h3>

        <div ref={messagesRef} className="scrollbar-soft min-h-0 space-y-3 overflow-auto pr-1">
          {messages.map((item) => (
            <div key={item.id} className="flex gap-2">
              <Avatar user={item.user} size="sm" />
              <div className="min-w-0 rounded-lg bg-zinc-950/80 px-3 py-2">
                <p className="text-xs font-bold text-zinc-300">{item.user.name}</p>
                <p className="break-words text-sm">{item.text}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="mt-3 min-h-5 text-xs text-muted">{typingUsers.length ? `${typingUsers.join(", ")} typing...` : ""}</div>

        <form className="mt-2 flex gap-2" onSubmit={send}>
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-zinc-800 bg-zinc-900 transition hover:bg-zinc-800" type="button" onClick={() => onReaction("🔥")} title="React">
            <Smile size={18} />
          </button>
          <input
            className="h-11 min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950/90 px-3 outline-none transition focus:border-brand"
            placeholder="Message"
            value={message}
            onChange={(event) => {
              const nextMessage = event.target.value;
              setMessage(nextMessage);
              onTyping(Boolean(nextMessage.trim()));
            }}
            onBlur={() => onTyping(false)}
            onFocus={() => onTyping(Boolean(message.trim()))}
          />
          <button className="grid h-11 w-11 place-items-center rounded-lg bg-brand text-zinc-950 hover:bg-green-400" type="submit" title="Send">
            <Send size={18} />
          </button>
        </form>
      </section>
    </aside>
  );
}
