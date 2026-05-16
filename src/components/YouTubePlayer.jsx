import { Pause, Play, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "./Button.jsx";
import { useYouTubePlayer } from "../hooks/useYouTubePlayer.js";

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export default function YouTubePlayer({ currentVideo, playback, canControl, canAutoAdvance, onLocalEvent, onPrevious, onNext, onPlayerReady }) {
  const loadedVideoIdRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const player = useYouTubePlayer({
    onReady: onPlayerReady,
    onPlay: () => {},
    onPause: () => {},
    onEnded: () => {
      if (canAutoAdvance) onNext();
    }
  });

  function playFromButton() {
    if (!canControl) return;
    player.play();
    onLocalEvent("play-video", { timestamp: player.getCurrentTime() });
  }

  function pauseFromButton() {
    if (!canControl) return;
    player.pause();
    onLocalEvent("pause-video", { timestamp: player.getCurrentTime() });
  }

  function togglePlayback() {
    if (playback?.isPlaying) pauseFromButton();
    else playFromButton();
  }

  function seekToTimestamp(timestamp) {
    if (!canControl) return;
    const nextTimestamp = Math.min(Math.max(Number(timestamp) || 0, 0), duration || Number(timestamp) || 0);
    setProgress(nextTimestamp);
    player.seekTo(nextTimestamp);
    onLocalEvent("seek-video", { timestamp: nextTimestamp });
  }

  function toggleMute() {
    if (muted) {
      player.unMute();
      setMuted(false);
    } else {
      player.mute();
      setMuted(true);
    }
  }

  useEffect(() => {
    if (currentVideo) return;
    loadedVideoIdRef.current = null;
    setProgress(0);
    setDuration(0);
  }, [currentVideo]);

  useEffect(() => {
    if (!player.ready || !playback || !currentVideo) return;

    const age = playback.updatedAt ? (Date.now() - new Date(playback.updatedAt).getTime()) / 1000 : 0;
    const expected = playback.isPlaying ? playback.timestamp + Math.max(age, 0) : playback.timestamp;
    const current = player.getCurrentTime();
    const drift = Math.abs(current - expected);
    const playerState = player.getState();
    const isPlayingOrBuffering = playerState === 1 || playerState === 3;

    if (loadedVideoIdRef.current !== currentVideo.videoId) {
      loadedVideoIdRef.current = currentVideo.videoId;
      setProgress(expected);
      player.load(currentVideo.videoId, expected, playback.isPlaying);
    } else {
      if (drift > 2.5) player.seekTo(expected);
      if (playback.isPlaying && !isPlayingOrBuffering) player.play();
      if (!playback.isPlaying && playerState !== 2) player.pause();
    }
  }, [player.ready, playback?.timestamp, playback?.isPlaying, playback?.updatedAt, currentVideo?.videoId]);

  useEffect(() => {
    if (!player.ready || !currentVideo) return;

    const interval = window.setInterval(() => {
      setProgress(player.getCurrentTime());
      setDuration(player.getDuration());
      setMuted(player.isMuted());
    }, 500);

    return () => window.clearInterval(interval);
  }, [player.ready, currentVideo?.videoId, player.getCurrentTime, player.getDuration, player.isMuted]);

  if (!currentVideo) {
    return (
      <section className="grid aspect-video min-h-52 w-full max-h-[calc(100vh-11rem)] place-items-center rounded-xl border border-zinc-800 bg-zinc-950/90 text-center shadow-glow">
        <div className="max-w-sm space-y-3 px-6">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-zinc-800 bg-zinc-900 text-brand">
            <Play size={24} />
          </div>
          <h2 className="text-xl font-black">Search for a video to begin</h2>
          <p className="text-sm leading-6 text-muted">The first selected video becomes the shared room player for everyone.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0 space-y-3">
      <div className="player-frame aspect-video w-full max-h-[calc(100vh-11rem)] overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-glow">
        <div ref={player.containerRef} className="h-full w-full" />
      </div>
      <div className="rounded-xl border border-zinc-800 bg-panel/95 p-4">
        <div className="space-y-4">
          <div className="min-w-0 text-center">
            <h2 className="truncate text-lg font-black leading-tight">{currentVideo.title}</h2>
            <p className="mt-1 truncate text-sm text-muted">{currentVideo.channelTitle}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button className="h-11 w-11 px-0" variant="ghost" onClick={toggleMute} title={muted ? "Unmute" : "Mute"}>
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
            <Button className="h-11 w-11 px-0" variant="ghost" disabled={!canControl} onClick={() => seekToTimestamp(0)} title="Restart">
              <RotateCcw size={18} />
            </Button>
            <Button className="h-11 w-11 px-0" variant="ghost" disabled={!canControl} onClick={onPrevious} title="Previous song">
              <SkipBack size={18} />
            </Button>
            <Button className="h-12 min-h-12 w-12 rounded-full px-0" disabled={!canControl} onClick={togglePlayback} title={playback?.isPlaying ? "Pause" : "Play"}>
              {playback?.isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            <Button className="h-11 w-11 px-0" variant="ghost" disabled={!canControl} onClick={onNext} title="Next video">
              <SkipForward size={18} />
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[3rem_minmax(0,1fr)_3rem] items-center gap-3">
          <span className="text-xs tabular-nums text-muted">{formatTime(progress)}</span>
          <input
            className="player-range h-2 min-w-0 disabled:cursor-not-allowed disabled:opacity-50"
            type="range"
            min="0"
            max={Math.max(duration, 1)}
            step="1"
            value={Math.min(progress, Math.max(duration, 1))}
            disabled={!canControl || !duration}
            onChange={(event) => setProgress(Number(event.target.value))}
            onMouseUp={(event) => seekToTimestamp(event.currentTarget.value)}
            onTouchEnd={(event) => seekToTimestamp(event.currentTarget.value)}
            aria-label="Seek video"
          />
          <span className="text-right text-xs tabular-nums text-muted">{formatTime(duration)}</span>
        </div>
      </div>
    </section>
  );
}
