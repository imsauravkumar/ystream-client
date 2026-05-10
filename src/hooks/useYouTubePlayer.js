import { useCallback, useEffect, useRef, useState } from "react";

let apiReadyPromise;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiReadyPromise) return apiReadyPromise;

  apiReadyPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });

  return apiReadyPromise;
}

export function useYouTubePlayer({ onPlay, onPause, onEnded, onReady }) {
  const [containerElement, setContainerElement] = useState(null);
  const playerRef = useRef(null);
  const callbacksRef = useRef({ onPlay, onPause, onEnded, onReady });
  const [ready, setReady] = useState(false);
  const containerRef = useCallback((node) => {
    setContainerElement(node);
  }, []);

  useEffect(() => {
    callbacksRef.current = { onPlay, onPause, onEnded, onReady };
  }, [onPlay, onPause, onEnded, onReady]);

  useEffect(() => {
    if (!containerElement) return;
    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !containerElement) return;

      playerRef.current = new YT.Player(containerElement, {
        width: "100%",
        height: "100%",
        videoId: "",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          modestbranding: 1,
          origin: window.location.origin,
          rel: 0,
          playsinline: 1
        },
        events: {
          onReady: () => {
            setReady(true);
            callbacksRef.current.onReady?.(playerRef.current);
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) callbacksRef.current.onPlay?.();
            if (event.data === YT.PlayerState.PAUSED) callbacksRef.current.onPause?.();
            if (event.data === YT.PlayerState.ENDED) callbacksRef.current.onEnded?.();
          }
        }
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
      setReady(false);
    };
  }, [containerElement]);

  const controls = {
    load: useCallback((nextVideoId, seconds = 0, autoplay = false) => {
      if (!nextVideoId || !playerRef.current) return;
      const payload = { videoId: nextVideoId, startSeconds: Math.max(0, Number(seconds) || 0) };
      if (autoplay) playerRef.current.loadVideoById?.(payload);
      else playerRef.current.cueVideoById?.(payload);
    }, []),
    play: useCallback(() => playerRef.current?.playVideo?.(), []),
    pause: useCallback(() => playerRef.current?.pauseVideo?.(), []),
    mute: useCallback(() => playerRef.current?.mute?.(), []),
    unMute: useCallback(() => playerRef.current?.unMute?.(), []),
    isMuted: useCallback(() => Boolean(playerRef.current?.isMuted?.()), []),
    seekTo: useCallback((seconds) => playerRef.current?.seekTo?.(seconds, true), []),
    getCurrentTime: useCallback(() => playerRef.current?.getCurrentTime?.() || 0, []),
    getDuration: useCallback(() => playerRef.current?.getDuration?.() || 0, []),
    getState: useCallback(() => playerRef.current?.getPlayerState?.(), [])
  };

  return { containerRef, ready, ...controls };
}
