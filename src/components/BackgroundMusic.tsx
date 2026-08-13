"use client";
import { useState, useRef } from "react";

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
  const [started, setStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytId = getYouTubeId(musicUrl);

  const sendYT = (func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "*"
    );
  };

  const startMusic = () => {
    if (ytId) {
      sendYT("playVideo");
      sendYT("unMute");
    } else if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    setStarted(true);
    setPlaying(true);
  };

  const toggle = () => {
    if (!started) { startMusic(); return; }
    if (ytId) {
      playing ? sendYT("pauseVideo") : (sendYT("playVideo"), sendYT("unMute"));
    } else if (audioRef.current) {
      playing ? audioRef.current.pause() : audioRef.current.play().catch(() => {});
    }
    setPlaying((p) => !p);
  };

  return (
    <>
      {ytId ? (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&enablejsapi=1`}
          allow="autoplay; encrypted-media"
          title="Musica de fondo"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "1px",
            height: "1px",
            opacity: 0.01,
            pointerEvents: "none",
            border: "none",
            zIndex: -1,
          }}
        />
      ) : (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          autoPlay
          style={{ display: "none" }}
          onPlay={() => { setStarted(true); setPlaying(true); }}
        />
      )}

      {/* Barra inferior animada — visible solo hasta que el usuario hace click */}
      {!started && (
        <div
          onClick={startMusic}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.75)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            padding: "0.75rem 1rem",
            backdropFilter: "blur(6px)",
            animation: "slideUp 0.5s ease",
          }}
        >
          <span style={{ fontSize: "1.1rem", animation: "pulse 1.5s infinite" }}>?</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.03em" }}>
            Toca para escuchar la musica de fondo
          </span>
        </div>
      )}

      {/* Boton flotante play/pause — visible solo despues de iniciar */}
      {started && (
        <button
          onClick={toggle}
          title={playing ? "Pausar musica" : "Reproducir musica"}
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
          }}
        >
          {playing ? "\u23F8" : "\u266B"}
        </button>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </>
  );
}
