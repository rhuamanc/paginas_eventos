import { notFound } from "next/navigation";
import { getInvitationBySlug } from "@/lib/storage";
import Countdown from "@/components/Countdown";
import RsvpForm from "@/components/RsvpForm";
import CommentsSection from "@/components/CommentsSection";
import type { Invitation, SectionKey } from "@/types/invitation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const THEMES = {
  elegant: { bg: "#12192b", text: "#f0e6c8", accent: "#c9a84c", card: "#1e2d47" },
  romantic: { bg: "#fff0f3", text: "#5c2d45", accent: "#d4608a", card: "#ffe8ee" },
  modern:   { bg: "#ffffff", text: "#111111", accent: "#1a1a1a", card: "#f5f5f5" },
  floral:   { bg: "#f8f4ef", text: "#3d3325", accent: "#7b9e6b", card: "#eee5d6" },
} as const;

const EVENT_LABELS: Record<string, string> = {
  boda: "Boda", cumpleanos: "Cumpleanos", "baby-shower": "Baby Shower",
  graduacion: "Graduacion", otro: "Evento especial",
};

function formatDate(iso: string) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleString("es-PE", { dateStyle: "full", timeStyle: "short" }); }
  catch { return iso; }
}

function parsePeopleList(text?: string) {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default async function PublicInvitationPage({ params }: Props) {
  const { slug } = await params;
  const inv: Invitation | null = await getInvitationBySlug(slug);
  if (!inv) notFound();

  const theme = THEMES[inv.theme as keyof typeof THEMES] ?? THEMES.elegant;
  const accent = inv.primaryColor || theme.accent;
  const sectionOrder: SectionKey[] = inv.sectionOrder?.length
    ? inv.sectionOrder
    : ["hero", "details", "countdown", "timeline", "family", "parish", "reception", "gallery", "message", "dressCode", "rsvp", "music"];
  const enabledSections: SectionKey[] = inv.sections?.length
    ? inv.sections
    : sectionOrder;
  const sections = sectionOrder.filter((section) => enabledSections.includes(section));

  const themeVars = {
    "--th-bg": theme.bg, "--th-text": inv.textColor || theme.text,
    "--th-accent": accent, "--th-card": theme.card,
  } as React.CSSProperties;

  return (
    <main style={{ ...themeVars, background: "var(--th-bg)", color: "var(--th-text)", fontFamily: "Georgia,serif", minHeight: "100vh" }}>
      {inv.musicUrl && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio src={inv.musicUrl} autoPlay loop style={{ display: "none" }} />
      )}

      {sections.map((key) => {
        switch (key) {
          case "hero":
            return (
              <section key="hero" className="flex flex-col items-center justify-center py-28 px-6 text-center min-h-[60vh]"
                style={{
                  background: inv.heroImage
                    ? `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.58)),url(${inv.heroImage}) center/cover no-repeat`
                    : `linear-gradient(135deg,var(--th-card),var(--th-bg))`,
                  color: inv.heroImage ? "#fff" : "var(--th-text)",
                }}>
                <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-70">{EVENT_LABELS[inv.eventType] ?? inv.eventType}</p>
                <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">{inv.title}</h1>
                {inv.subtitle && <p className="text-xl opacity-80 max-w-lg whitespace-pre-line">{inv.subtitle}</p>}
              </section>
            );

          case "details":
            if (!inv.hostNames && !inv.dateTime && !inv.place) return null;
            return (
              <section key="details" className="py-16 px-6 text-center" style={{ background: "var(--th-card)" }}>
                {inv.hostNames && <p className="text-2xl font-semibold mb-6">{inv.hostNames}</p>}
                <div className="flex flex-wrap justify-center gap-10">
                  {inv.dateTime && (
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Fecha y hora</p>
                      <p className="text-lg">{formatDate(inv.dateTime)}</p>
                    </div>
                  )}
                  {inv.place && (
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Lugar</p>
                      <p className="text-lg">{inv.place}</p>
                      {inv.address && <p className="text-sm opacity-60 mt-1">{inv.address}</p>}
                    </div>
                  )}
                </div>
              </section>
            );

          case "countdown":
            return (
              <section key="countdown" className="py-14 px-6 text-center">
                <p className="text-xs uppercase tracking-widest opacity-60 mb-6">Cuenta regresiva</p>
                <Countdown dateTime={inv.dateTime ?? ""} />
              </section>
            );

          case "timeline":
            if (!inv.timeline?.length) return null;
            return (
              <section key="timeline" className="py-14 px-6" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-6">Programacion del evento</p>
                <div className="mx-auto max-w-3xl space-y-3">
                  {inv.timeline.map((item, index) => (
                    <div key={`${item.time}-${item.title}-${index}`} className="grid gap-3 rounded-2xl bg-white/50 px-4 py-4 md:grid-cols-[120px_1fr]">
                      <div className="text-lg font-semibold" style={{ color: "var(--th-accent)" }}>{item.time}</div>
                      <div>
                        <p className="text-lg font-semibold">{item.title}</p>
                        {item.description ? <p className="mt-1 text-sm opacity-70">{item.description}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case "family": {
            const parents = parsePeopleList(inv.parents);
            const godparents = parsePeopleList(inv.godparents);
            const witnesses = parsePeopleList(inv.witnesses);
            if (!parents.length && !godparents.length && !witnesses.length) return null;

            return (
              <section key="family" className="py-14 px-6" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-6">Familia y acompañantes</p>
                <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-white/50 p-4">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wide">Padres</p>
                    {parents.length ? (
                      <ul className="space-y-1 text-sm">
                        {parents.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    ) : <p className="text-sm opacity-60">Sin datos</p>}
                  </div>

                  <div className="rounded-2xl bg-white/50 p-4">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wide">Padrinos</p>
                    {godparents.length ? (
                      <ul className="space-y-1 text-sm">
                        {godparents.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    ) : <p className="text-sm opacity-60">Sin datos</p>}
                  </div>

                  <div className="rounded-2xl bg-white/50 p-4">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wide">Testigos</p>
                    {witnesses.length ? (
                      <ul className="space-y-1 text-sm">
                        {witnesses.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    ) : <p className="text-sm opacity-60">Sin datos</p>}
                  </div>
                </div>
              </section>
            );
          }

          case "parish":
            if (!inv.parishName && !inv.parishTime && !inv.parishMapUrl) return null;
            return (
              <section key="parish" className="py-14 px-6 text-center">
                <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Parroquia</p>
                {inv.parishName ? <p className="text-2xl font-semibold">{inv.parishName}</p> : null}
                {inv.parishTime ? <p className="mt-2 text-sm opacity-70">Hora: {inv.parishTime}</p> : null}
                {inv.parishMapUrl ? (
                  <div className="mt-6 rounded-2xl overflow-hidden max-w-3xl mx-auto shadow-lg w-full" style={{ height: 320 }}>
                    <iframe src={inv.parishMapUrl} className="w-full h-full border-0" title="Ubicacion de la parroquia" loading="lazy" />
                  </div>
                ) : null}
              </section>
            );

          case "reception":
            if (!inv.receptionName && !inv.receptionTime && !inv.receptionMapUrl) return null;
            return (
              <section key="reception" className="py-14 px-6 text-center" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Salon de recepciones</p>
                {inv.receptionName ? <p className="text-2xl font-semibold">{inv.receptionName}</p> : null}
                {inv.receptionTime ? <p className="mt-2 text-sm opacity-70">Hora: {inv.receptionTime}</p> : null}
                {inv.receptionMapUrl ? (
                  <div className="mt-6 rounded-2xl overflow-hidden max-w-3xl mx-auto shadow-lg w-full" style={{ height: 320 }}>
                    <iframe src={inv.receptionMapUrl} className="w-full h-full border-0" title="Ubicacion del salon de recepciones" loading="lazy" />
                  </div>
                ) : null}
              </section>
            );

          case "gallery":
            if (!inv.gallery?.length) return null;
            return (
              <section key="gallery" className="py-14 px-6" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-6">Galeria de fotos</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
                  {inv.gallery.map((src, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </section>
            );

          case "message":
            if (!inv.message) return null;
            return (
              <section key="message" className="py-16 px-8 text-center">
                <p className="text-xl md:text-2xl italic leading-relaxed max-w-2xl mx-auto opacity-90">
                  &ldquo;{inv.message}&rdquo;
                </p>
              </section>
            );

          case "dressCode":
            if (!inv.dressCode) return null;
            return (
              <section key="dressCode" className="py-10 px-6 text-center" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Dress Code</p>
                <p className="text-xl font-semibold">{inv.dressCode}</p>
              </section>
            );

          case "rsvp":
            return (
              <section key="rsvp" className="py-14 px-6" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-8">Confirma tu asistencia</p>
                <RsvpForm invitationId={inv.id} />
              </section>
            );

          case "music":
            return null;

          default:
            return null;
        }
      })}

      <section className="py-14 px-6">
        <div className="mx-auto max-w-3xl">
          <CommentsSection invitationId={inv.id} />
        </div>
      </section>
    </main>
  );
}
