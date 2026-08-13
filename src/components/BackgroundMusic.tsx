"use client";
import { useState, useRef, useEffect } from "react";

function getYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function BackgroundMusic({ musicUrl }: { musicUrl: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytId = getYouTubeId(musicUrl);

  // Intentar autoplay para audio directo al montar
  useEffect(() => {
    if (!ytId && audioRef.current) {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [ytId]);

  const toggle = () => {
    if (ytId && iframeRef.current) {
      const iframe = iframeRef.current;
      if (playing) {
        iframe.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          "*"
        );
        setPlaying(false);
      } else {
        iframe.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "*"
        );
        setPlaying(true);
      }
    } else if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play();
        setPlaying(true);
      }
    }
  };

  return (
    <>
      {ytId ? (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}&controls=0&enablejsapi=1`}
          allow="autoplay"
          title="Música de fondo"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
            border: "none",
          }}
          onLoad={() => setPlaying(true)}
        />
      ) : (
        <audio ref={audioRef} src={musicUrl} loop style={{ display: "none" }} />
      )}

      <button
        onClick={toggle}
        title={playing ? "Pausar música" : "Reproducir música"}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 50,
          width: "2.75rem",
          height: "2.75rem",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.55)",
          color: "#fff",
          border: "2px solid rgba(255,255,255,0.25)",
          cursor: "pointer",
          fontSize: "1.15rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(6px)",
          transition: "background 0.2s",
        }}
      >
        {playing ? "⏸" : "♫"}
      </button>
    </>
  );
}
