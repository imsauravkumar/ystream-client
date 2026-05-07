import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useRef } from "react";
import Button from "./Button.jsx";
import { useYouTubePlayer } from "../hooks/useYouTubePlayer.js";

export default function YouTubePlayer({ currentVideo, playback, canControl, onLocalEvent, onNext, onPlayerReady }) {
  const remoteActionRef = useRef(false);
  const lastBroadcastRef = useRef(0);
  const player = useYouTubePlayer({
    videoId: currentVideo?.videoId,
    onReady: onPlayerReady,
    onPlay: () => {
      if (remoteActionRef.current) return;
      const now = Date.now();
      if (now - lastBroadcastRef.current < 800) return;
      lastBroadcastRef.current = now;
      onLocalEvent("play-video", { timestamp: player.getCurrentTime() });
    },
    onPause: () => {
      if (remoteActionRef.current) return;
      const now = Date.now();
      if (now - lastBroadcastRef.current < 800) return;
      lastBroadcastRef.current = now;
      onLocalEvent("pause-video", { timestamp: player.getCurrentTime() });
    },
    onEnded: onNext
  });

  function playFromButton() {
    player.play();
    onLocalEvent("play-video", { timestamp: player.getCurrentTime() });
  }

  function pauseFromButton() {
    player.pause();
    onLocalEvent("pause-video", { timestamp: player.getCurrentTime() });
  }

  useEffect(() => {
    if (!player.ready || !playback || !currentVideo) return;

    const age = playback.updatedAt ? (Date.now() - new Date(playback.updatedAt).getTime()) / 1000 : 0;
    const expected = playback.isPlaying ? playback.timestamp + Math.max(age, 0) : playback.timestamp;
    const current = player.getCurrentTime();
    const drift = Math.abs(current - expected);

    remoteActionRef.current = true;
    if (drift > 1.25) player.seekTo(expected);
    if (playback.isPlaying) player.play();
    else player.pause();
    window.setTimeout(() => {
      remoteActionRef.current = false;
    }, 900);
  }, [player.ready, playback?.timestamp, playback?.isPlaying, playback?.updatedAt, currentVideo?.videoId]);

  if (!currentVideo) {
    return (
      <section className="grid aspect-video w-full place-items-center rounded-xl border border-zinc-800 bg-zinc-950 text-center">
        <div className="max-w-sm space-y-3 px-6">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-zinc-900 text-brand">
            <Play size={24} />
          </div>
          <h2 className="text-xl font-black">Search for a video to begin</h2>
          <p className="text-sm leading-6 text-muted">The first selected video becomes the shared room player for everyone.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="aspect-video overflow-hidden rounded-xl border border-zinc-800 bg-black">
        <div ref={player.containerRef} className="h-full w-full" />
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-panel p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-black">{currentVideo.title}</h2>
          <p className="truncate text-sm text-muted">{currentVideo.channelTitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" disabled={!canControl} onClick={() => onLocalEvent("seek-video", { timestamp: 0 })} title="Restart">
            <RotateCcw size={18} />
          </Button>
          <Button variant="ghost" disabled={!canControl} onClick={playFromButton} title="Play">
            <Play size={18} />
          </Button>
          <Button variant="ghost" disabled={!canControl} onClick={pauseFromButton} title="Pause">
            <Pause size={18} />
          </Button>
          <Button variant="danger" disabled={!canControl} onClick={onNext} title="Next video">
            <SkipForward size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
}
