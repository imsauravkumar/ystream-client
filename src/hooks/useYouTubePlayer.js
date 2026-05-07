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

export function useYouTubePlayer({ videoId, onPlay, onPause, onEnded, onReady }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const callbacksRef = useRef({ onPlay, onPause, onEnded, onReady });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    callbacksRef.current = { onPlay, onPause, onEnded, onReady };
  }, [onPlay, onPause, onEnded, onReady]);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !containerRef.current) return;

      playerRef.current = new YT.Player(containerRef.current, {
        width: "100%",
        height: "100%",
        videoId: videoId || "",
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
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
  }, []);

  useEffect(() => {
    if (!ready || !videoId || !playerRef.current?.loadVideoById) return;
    playerRef.current.loadVideoById(videoId);
  }, [ready, videoId]);

  const controls = {
    play: useCallback(() => playerRef.current?.playVideo?.(), []),
    pause: useCallback(() => playerRef.current?.pauseVideo?.(), []),
    seekTo: useCallback((seconds) => playerRef.current?.seekTo?.(seconds, true), []),
    getCurrentTime: useCallback(() => playerRef.current?.getCurrentTime?.() || 0, []),
    getState: useCallback(() => playerRef.current?.getPlayerState?.(), [])
  };

  return { containerRef, ready, ...controls };
}
