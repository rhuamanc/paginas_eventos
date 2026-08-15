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

function getInitials(title: string): string {
  const parts = title.split(/\s*&\s*/);
  if (parts.length >= 2) {
    const a = parts[0].trim().split(/\s+/)[0]?.[0] ?? "";
    const b = parts[1].trim().split(/\s+/)[0]?.[0] ?? "";
    return a + "&" + b;
  }
  return title.slice(0, 2).toUpperCase();
}

function formatShortDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}.${mm}.${yy}`;
  } catch { return ""; }
}

const EVENT_DISPLAY: Record<string, string> = {
  boda: "Nuestra Boda",
  cumpleanos: "Mi Cumplea\u00f1os",
  "baby-shower": "Baby Shower",
  graduacion: "Mi Graduaci\u00f3n",
  otro: "Evento Especial",
};

type Phase = "idle" | "opening" | "done";

export default function EnvelopeIntro({
  musicUrl,
  accentColor = "#c9a84c",
  eventType = "boda",
  eventTypeLabel,
  title = "",
  hostNames,
  dateTime,
}: {
  musicUrl?: string;
  accentColor?: string;
  eventType?: string;
  eventTypeLabel?: string;
  title?: string;
  hostNames?: string;
  dateTime?: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytId = musicUrl ? getYouTubeId(musicUrl) : null;
  const acc = accentColor || "#c9a84c";

  const displayLabel = eventTypeLabel || EVENT_DISPLAY[eventType] || "Evento Especial";
  const initials = getInitials(title);
  const shortDate = dateTime ? formatShortDate(dateTime) : "";
  const scriptFont = "var(--font-dancing-script, 'Dancing Script', Georgia, serif)";

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
      if (ytId) { sendYT("playVideo"); sendYT("unMute"); }
      else if (audioRef.current) { audioRef.current.play().catch(() => {}); }
      setMusicPlaying(true);
    }
    setTimeout(() => setPhase("done"), 2100);
  };

  const toggleMusic = () => {
    if (!musicUrl) return;
    if (ytId) {
      if (musicPlaying) { sendYT("pauseVideo"); }
      else { sendYT("playVideo"); sendYT("unMute"); }
    } else if (audioRef.current) {
      musicPlaying ? audioRef.current.pause() : audioRef.current.play().catch(() => {});
    }
    setMusicPlaying((p) => !p);
  };

  const envW = "min(320px, 88vw)";

  return (
    <>
      {musicUrl && ytId && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&enablejsapi=1`}
          allow="autoplay; encrypted-media"
          title="Musica de fondo"
          style={{ position: "fixed", top: 0, left: 0, width: "1px", height: "1px", opacity: 0.01, border: "none", zIndex: -1 }}
        />
      )}
      {musicUrl && !ytId && (
        <audio ref={audioRef} src={musicUrl} loop style={{ display: "none" }} />
      )}

      {phase !== "done" && (
        <div
          onClick={handleOpen}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "#faf7ef",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "flex-start",
            overflowY: "auto",
            cursor: phase === "idle" ? "pointer" : "default",
            pointerEvents: phase === "opening" ? "none" : "auto",
            animation: phase === "opening" ? "ei-fadeOut 2.1s 0.7s ease forwards" : "ei-fadeIn 0.5s ease",
            userSelect: "none",
          }}
        >
          {/* Decoracion esquinas - hoja estilizada */}
          <svg style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }} width="90" height="90" viewBox="0 0 90 90" fill="none">
            <path d="M0 0 Q40 5 30 45 Q15 25 0 0Z" fill={acc} opacity="0.12"/>
            <path d="M5 0 Q35 10 22 48" stroke={acc} strokeWidth="0.8" opacity="0.35" fill="none"/>
          </svg>
          <svg style={{ position: "absolute", top: 0, right: 0, pointerEvents: "none" }} width="90" height="90" viewBox="0 0 90 90" fill="none">
            <path d="M90 0 Q50 5 60 45 Q75 25 90 0Z" fill={acc} opacity="0.12"/>
            <path d="M85 0 Q55 10 68 48" stroke={acc} strokeWidth="0.8" opacity="0.35" fill="none"/>
          </svg>
          <svg style={{ position: "absolute", bottom: 0, left: 0, pointerEvents: "none" }} width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M0 80 Q5 40 45 50 Q25 65 0 80Z" fill={acc} opacity="0.12"/>
          </svg>
          <svg style={{ position: "absolute", bottom: 0, right: 0, pointerEvents: "none" }} width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M80 80 Q75 40 35 50 Q55 65 80 80Z" fill={acc} opacity="0.12"/>
          </svg>

          {/* Texto superior */}
          <div style={{ textAlign: "center", paddingTop: "8vh", paddingBottom: "2.5vh", zIndex: 1 }}>
            <p style={{ fontStyle: "italic", color: acc, fontSize: "1rem", margin: 0, opacity: 0.85 }}>
              Est{"\u00E1"}n invitados a:
            </p>
            <h1 style={{
              fontFamily: scriptFont,
              fontSize: "clamp(2rem, 8vw, 3.2rem)",
              color: acc,
              fontWeight: 700,
              lineHeight: 1.2,
              margin: "0.25rem 0 0.6rem",
              padding: "0 1rem",
            }}>
              {displayLabel}
            </h1>
            <div style={{ color: acc, fontSize: "0.8rem", letterSpacing: "0.25em", opacity: 0.55, margin: "0.5rem 0" }}>
              {"\u2014"} {"\u00B7"} + {"\u00B7"} {"\u2014"}
            </div>
            {shortDate && (
              <p style={{ fontFamily: scriptFont, fontSize: "1.5rem", color: acc, opacity: 0.75, margin: 0 }}>
                {shortDate}
              </p>
            )}
          </div>

          {/* Sobre horizontal */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              width: envW,
              height: 185,
              position: "relative",
              perspective: "1200px",
            }}>
              {/* Cuerpo del sobre */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(160deg, #eaf1f8 0%, #dce8f2 55%, #cddbe9 100%)",
                borderRadius: 6,
                boxShadow: "0 10px 36px rgba(0,0,0,0.13), 0 0 0 1px rgba(170,190,210,0.4)",
                overflow: "hidden",
              }}>
                {/* Lineas V del sobre */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: `
                    linear-gradient(to bottom right, transparent 49.6%, rgba(170,190,210,0.3) 50%, transparent 50.4%),
                    linear-gradient(to bottom left,  transparent 49.6%, rgba(170,190,210,0.3) 50%, transparent 50.4%)
                  `,
                }} />

                {/* Titulo completo en script */}
                <div style={{
                  position: "absolute",
                  top: "40%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontFamily: scriptFont,
                  fontSize: "clamp(1.4rem, 6vw, 2.2rem)",
                  color: acc,
                  whiteSpace: "nowrap",
                  letterSpacing: "0.03em",
                  textAlign: "center",
                  padding: "0 12px",
                  maxWidth: "90%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {title || displayLabel}
                </div>

                {/* Linea de cierre horizontal */}
                <div style={{
                  position: "absolute", bottom: "37%", left: 0, right: 0,
                  height: 1, background: `${acc}25`,
                }} />
              </div>

              {/* Solapa inferior del sobre (rota al abrir) */}
              <div style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                height: "39%",
                background: "linear-gradient(180deg, #cddbe9 0%, #c2d3e4 100%)",
                borderRadius: "0 0 6px 6px",
                transformOrigin: "bottom center",
                zIndex: 3,
                boxShadow: "0 -2px 6px rgba(0,0,0,0.06)",
                animation: phase === "opening"
                  ? "ei-flapOpen 0.85s 0.12s cubic-bezier(0.4,0,0.2,1) forwards"
                  : undefined,
              }}>
                {/* Sello de cera */}
                {phase === "idle" && (
                  <div style={{
                    position: "absolute",
                    top: "42%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 52, height: 52,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 38% 33%, ${acc}f5, ${acc}99)`,
                    boxShadow: `0 3px 10px rgba(0,0,0,0.22), 0 0 0 3px ${acc}55, 0 0 18px ${acc}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "ei-sealGlow 2.2s ease-in-out infinite",
                  }}>
                    {/* Icono floral hoja */}
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 21 C12 21 4 14 4 8 C4 5 7.5 2 12 4 C16.5 2 20 5 20 8 C20 14 12 21 12 21Z" fill="#fffbe8" opacity="0.9"/>
                      <line x1="12" y1="21" x2="12" y2="7" stroke="#fffbe8" strokeWidth="1" opacity="0.6"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Tarjeta que sube al abrir */}
              {phase === "opening" && (
                <div style={{
                  position: "absolute",
                  bottom: 8, left: 10, right: 10,
                  height: 168,
                  background: "linear-gradient(150deg, #fff 0%, #fdf8ee 100%)",
                  borderRadius: 4,
                  boxShadow: "0 -6px 22px rgba(0,0,0,0.13)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, color: acc,
                  zIndex: 2,
                  animation: "ei-cardRise 0.95s 0.38s cubic-bezier(0.2,0,0.1,1) forwards",
                }}>
                  {"\u2665"}
                </div>
              )}
            </div>

            {/* Flecha punteada hacia el sello */}
            {phase === "idle" && (
              <svg
                style={{ position: "absolute", bottom: -32, left: "25%", pointerEvents: "none", overflow: "visible" }}
                width="90" height="60" viewBox="0 0 90 60" fill="none"
              >
                <path d="M8 56 Q18 10 54 38" stroke={acc} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.55"/>
                <polygon points="54,38 45,30 58,28" fill={acc} opacity="0.55"/>
              </svg>
            )}
          </div>

          {/* CTA */}
          {phase === "idle" && (
            <p style={{
              marginTop: "5vh",
              color: acc,
              fontStyle: "italic",
              fontSize: "1rem",
              letterSpacing: "0.04em",
              animation: "ei-float 2.4s ease-in-out infinite",
              zIndex: 1,
            }}>
              &gt; Toca para abrir la invitaci{"\u00F3"}n
            </p>
          )}
        </div>
      )}

      {/* Boton flotante play/pause */}
      {phase === "done" && musicUrl && (
        <button
          onClick={toggleMusic}
          title={musicPlaying ? "Pausar musica" : "Reproducir musica"}
          style={{
            position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 50,
            width: "2.75rem", height: "2.75rem", borderRadius: "50%",
            background: "rgba(0,0,0,0.55)", color: "#fff",
            border: "2px solid rgba(255,255,255,0.25)", cursor: "pointer",
            fontSize: "1.15rem", display: "flex", alignItems: "center",
            justifyContent: "center", backdropFilter: "blur(6px)",
          }}
        >
          {musicPlaying ? "| |" : "\u266B"}
        </button>
      )}

      <style>{`
        @keyframes ei-fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes ei-fadeOut { to   { opacity:0 } }
        @keyframes ei-flapOpen {
          0%   { transform: rotateX(0deg);    }
          100% { transform: rotateX(-170deg); }
        }
        @keyframes ei-cardRise {
          0%   { transform: translateY(0);      opacity:1; }
          100% { transform: translateY(-220px); opacity:0.4; }
        }
        @keyframes ei-sealGlow {
          0%,100% { box-shadow: 0 3px 10px rgba(0,0,0,0.22), 0 0 0 3px ${acc}55, 0 0 16px ${acc}44; }
          50%      { box-shadow: 0 3px 10px rgba(0,0,0,0.22), 0 0 0 5px ${acc}40, 0 0 30px ${acc}77; }
        }
        @keyframes ei-float {
          0%,100% { transform: translateY(0);    opacity:0.9; }
          50%      { transform: translateY(-4px); opacity:0.65; }
        }
      `}</style>
    </>
  );
}

