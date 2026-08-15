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

type Phase = "idle" | "opening" | "done";

export default function EnvelopeIntro({
  musicUrl,
  accentColor = "#c9a84c",
}: {
  musicUrl?: string;
  accentColor?: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytId = musicUrl ? getYouTubeId(musicUrl) : null;
  const acc = accentColor || "#c9a84c";

  const sendYT = (func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "*"
    );
  };

  const handleOpen = () => {
    if (phase !== "idle") return;
    setPhase("opening");
    if (musicUrl) {
      if (ytId) {
        sendYT("playVideo");
        sendYT("unMute");
      } else if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      setMusicPlaying(true);
    }
    setTimeout(() => setPhase("done"), 1900);
  };

  const toggleMusic = () => {
    if (!musicUrl) return;
    if (ytId) {
      if (musicPlaying) {
        sendYT("pauseVideo");
      } else {
        sendYT("playVideo");
        sendYT("unMute");
      }
    } else if (audioRef.current) {
      musicPlaying ? audioRef.current.pause() : audioRef.current.play().catch(() => {});
    }
    setMusicPlaying((p) => !p);
  };

  return (
    <>
      {/* Media player oculto */}
      {musicUrl && ytId && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&enablejsapi=1`}
          allow="autoplay; encrypted-media"
          title="Musica de fondo"
          style={{
            position: "fixed", top: 0, left: 0,
            width: "1px", height: "1px",
            opacity: 0.01, border: "none", zIndex: -1,
          }}
        />
      )}
      {musicUrl && !ytId && (
        <audio ref={audioRef} src={musicUrl} loop style={{ display: "none" }} />
      )}

      {/* Pantalla intro con sobre */}
      {phase !== "done" && (
        <div
          onClick={handleOpen}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: phase === "idle" ? "pointer" : "default",
            background: "rgba(8, 5, 18, 0.92)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            animation: phase === "opening"
              ? "envOut 1.9s ease forwards"
              : "envIn 0.5s ease",
            pointerEvents: phase === "opening" ? "none" : "auto",
          }}
        >
          {/* Sobre */}
          <div style={{ position: "relative", width: 260, height: 178, perspective: "900px" }}>

            {/* Cuerpo del sobre */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(155deg, #f9f2de 0%, #ede0b2 55%, #e2ce96 100%)",
              borderRadius: 7,
              boxShadow: `0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px ${acc}55, 0 0 32px ${acc}22`,
              overflow: "hidden",
            }}>
              {/* Lineas interiores en V */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: `
                  linear-gradient(to bottom right, transparent 49.7%, ${acc}20 50%, transparent 50.3%),
                  linear-gradient(to bottom left,  transparent 49.7%, ${acc}20 50%, transparent 50.3%)
                `,
              }} />

              {/* Sello (solo cuando idle) */}
              {phase === "idle" && (
                <div style={{
                  position: "absolute",
                  top: "56%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 56, height: 56,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 38% 35%, ${acc}f0, ${acc}aa)`,
                  boxShadow: `0 3px 10px rgba(0,0,0,0.3), 0 0 0 3px ${acc}60, 0 0 22px ${acc}55`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  color: "#fffbe8",
                  animation: "sealGlow 2.2s ease-in-out infinite",
                  userSelect: "none",
                }}>
                  {"\u2665"}
                </div>
              )}

              {/* Tarjeta que sale durante apertura */}
              {phase === "opening" && (
                <div style={{
                  position: "absolute",
                  bottom: 5, left: 8, right: 8,
                  height: 165,
                  background: "linear-gradient(160deg, #fff 0%, #fdf9ee 100%)",
                  borderRadius: 4,
                  boxShadow: "0 -8px 24px rgba(0,0,0,0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  color: acc,
                  animation: "cardOut 0.95s 0.42s cubic-bezier(0.3,0,0.2,1) forwards",
                }}>
                  {"\u2665"}
                </div>
              )}
            </div>

            {/* Solapa superior (rota al abrir) */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "59%",
              clipPath: "polygon(0 0, 100% 0, 50% 89%)",
              background: `linear-gradient(170deg, #f2e7b8 0%, #d9c26a 55%, ${acc} 100%)`,
              transformOrigin: "top center",
              zIndex: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
              animation: phase === "opening"
                ? "flapOpen 0.78s cubic-bezier(0.4,0,0.2,1) forwards"
                : undefined,
              willChange: "transform",
            }} />
          </div>

          {/* Texto de invitacion (solo idle) */}
          {phase === "idle" && (
            <div style={{
              marginTop: 30,
              textAlign: "center",
              color: "#fff",
              userSelect: "none",
            }}>
              <p style={{
                fontSize: "0.95rem",
                fontWeight: 500,
                letterSpacing: "0.07em",
                opacity: 0.93,
                animation: "textFloat 2.4s ease-in-out infinite",
              }}>
                Toca para abrir tu invitaci{"\u00F3"}n
              </p>
              {musicUrl && (
                <p style={{
                  fontSize: "0.75rem",
                  opacity: 0.48,
                  marginTop: 8,
                  letterSpacing: "0.04em",
                }}>
                  {"\u266B"} con m{"\u00FA"}sica de fondo
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Boton flotante play/pause tras abrir */}
      {phase === "done" && musicUrl && (
        <button
          onClick={toggleMusic}
          title={musicPlaying ? "Pausar musica" : "Reproducir musica"}
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
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          {musicPlaying ? "| |" : "\u266B"}
        </button>
      )}

      <style>{`
        @keyframes flapOpen {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-174deg); }
        }
        @keyframes cardOut {
          0%   { transform: translateY(0);      opacity: 1; }
          100% { transform: translateY(-230px); opacity: 0.5; }
        }
        @keyframes envOut {
          0%, 52% { opacity: 1; }
          100%     { opacity: 0; }
        }
        @keyframes envIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sealGlow {
          0%, 100% { box-shadow: 0 3px 10px rgba(0,0,0,0.3), 0 0 0 3px ${acc}60, 0 0 22px ${acc}44; }
          50%       { box-shadow: 0 3px 10px rgba(0,0,0,0.3), 0 0 0 5px ${acc}40, 0 0 38px ${acc}80; }
        }
        @keyframes textFloat {
          0%, 100% { opacity: 0.93; transform: translateY(0px); }
          50%       { opacity: 0.72; transform: translateY(-3px); }
        }
      `}</style>
    </>
  );
}
