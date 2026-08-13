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
  const [entered, setEntered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytId = getYouTubeId(musicUrl);

  const startMusic = () => {
    if (ytId && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "playVideo", args: [] }),
        "*"
      );
    } else if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(true);
  };

  const handleEnter = () => {
    setEntered(true);
    startMusic();
  };

  const toggle = () => {
    if (ytId && iframeRef.current) {
      const cmd = playing ? "pauseVideo" : "playVideo";
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: cmd, args: [] }),
        "*"
      );
    } else if (audioRef.current) {
      playing ? audioRef.current.pause() : audioRef.current.play().catch(() => {});
    }
    setPlaying((p) => !p);
  };

  return (
    <>
      {/* Iframe/audio oculto — siempre presente para que esté listo al hacer click */}
      {ytId ? (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1&loop=1&playlist=${ytId}&controls=0`}
          allow="autoplay; encrypted-media"
          title="Música de fondo"
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
        <audio ref={audioRef} src={musicUrl} loop style={{ display: "none" }} />
      )}

      {/* Pantalla de bienvenida — se muestra solo antes de la primera interacción */}
      {!entered && (
        <div
          onClick={handleEnter}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.72)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              color: "#fff",
              textAlign: "center",
              padding: "2rem",
            }}
          >
            <span style={{ fontSize: "3rem", lineHeight: 1 }}>♫</span>
            <p style={{ fontSize: "1.25rem", fontWeight: 600, letterSpacing: "0.05em" }}>
              Toca para abrir la invitación
            </p>
            <p style={{ fontSize: "0.85rem", opacity: 0.65 }}>
              con música de fondo
            </p>
          </div>
        </div>
      )}

      {/* Botón flotante play/pause (solo visible tras entrar) */}
      {entered && (
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
      )}
    </>
  );
}
