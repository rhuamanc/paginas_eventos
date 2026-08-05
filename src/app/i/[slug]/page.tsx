import { notFound } from "next/navigation";
import { getInvitationBySlug } from "@/lib/storage";
import Countdown from "@/components/Countdown";
import RsvpForm from "@/components/RsvpForm";
import CommentsSection from "@/components/CommentsSection";
import TableLookup from "@/components/TableLookup";
import type { Invitation, SectionKey, BulletStyle } from "@/types/invitation";

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

function getBulletPrefix(style?: BulletStyle) {
  switch (style) {
    case "circle":
      return "◦";
    case "square":
      return "▪";
    case "dash":
      return "—";
    case "dot":
    default:
      return "•";
  }
}

export default async function PublicInvitationPage({ params }: Props) {
  const { slug } = await params;
  const inv: Invitation | null = await getInvitationBySlug(slug);
  if (!inv) notFound();

  const theme = THEMES[inv.theme as keyof typeof THEMES] ?? THEMES.elegant;
  const accent = inv.primaryColor || theme.accent;
  const ALL_SECTION_KEYS = ["hero", "details", "countdown", "timeline", "parents", "godparents", "witnesses", "parish", "reception", "gallery", "message", "giftTable", "dressCode", "rsvp", "music", "tables"] as const;
  const builtinOrder: SectionKey[] = inv.sectionOrder?.length
    ? inv.sectionOrder
    : [...ALL_SECTION_KEYS];
  const enabledSections: SectionKey[] = inv.sections?.length
    ? inv.sections
    : builtinOrder;
  const customSectionsById = Object.fromEntries((inv.customSections ?? []).map(cs => [cs.id, cs]));
  const fullOrder: string[] = inv.fullOrder?.length
    ? inv.fullOrder
    : [...builtinOrder, ...(inv.customSections ?? []).map(cs => cs.id)];

  const themeVars = {
    "--th-bg": theme.bg, "--th-text": inv.textColor || theme.text,
    "--th-accent": accent, "--th-card": theme.card,
  } as React.CSSProperties;

  return (
    <main style={{ ...themeVars, background: "var(--th-bg)", color: "var(--th-text)", fontFamily: inv.fontFamily || "Georgia,serif", zoom: inv.fontSize ? Number(inv.fontSize) : undefined, minHeight: "100vh" }}>
      {inv.musicUrl && (
        <audio src={inv.musicUrl} autoPlay loop style={{ display: "none" }} />
      )}

      {fullOrder.map((item) => {
        if (!(ALL_SECTION_KEYS as readonly string[]).includes(item)) {
          const cs = customSectionsById[item];
          if (!cs) return null;
          const csIdx = (inv.customSections ?? []).findIndex(c => c.id === item);
          return (
            <section key={item} className="py-12 px-6 text-center" style={{ background: csIdx % 2 === 0 ? "var(--th-card)" : "var(--th-bg)" }}>
              {cs.title ? <p className="text-xs uppercase tracking-widest opacity-60 mb-4">{cs.title}</p> : null}
              <p className="mx-auto max-w-2xl text-sm leading-relaxed whitespace-pre-line opacity-90">{cs.content}</p>
            </section>
          );
        }
        const key = item as SectionKey;
        if (!enabledSections.includes(key)) return null;
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
                <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-70">{inv.eventTypeLabel || (EVENT_LABELS[inv.eventType] ?? inv.eventType)}</p>
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

          case "parents": {
            const legacyParents = parsePeopleList(inv.parents);
            const brideParents = parsePeopleList(inv.brideParents || (legacyParents.length ? inv.parents : ""));
            const groomParents = parsePeopleList(inv.groomParents);
            if (!brideParents.length && !groomParents.length) return null;
            const bullet = getBulletPrefix(inv.parentsBulletStyle);

            return (
              <section key="parents" className="py-14 px-6" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-6">CON LA BENDICION DE NUESTRAS FAMILIAS:</p>
                <div className="mx-auto max-w-3xl rounded-2xl bg-white/50 p-4 space-y-4">
                  {brideParents.length ? (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider opacity-70">Padres de la novia</p>
                      <ul className="space-y-1 text-sm">
                        {brideParents.map((item) => (
                          <li key={`bride-${item}`}>{bullet} {item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {groomParents.length ? (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider opacity-70">Padres del novio</p>
                      <ul className="space-y-1 text-sm">
                        {groomParents.map((item) => (
                          <li key={`groom-${item}`}>{bullet} {item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </section>
            );
          }

          case "godparents": {
            const godparents = parsePeopleList(inv.godparents);
            if (!godparents.length) return null;
            const bullet = getBulletPrefix(inv.godparentsBulletStyle);
            return (
              <section key="godparents" className="py-14 px-6" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-6">Padrinos</p>
                <div className="mx-auto max-w-3xl rounded-2xl bg-white/50 p-4">
                  <ul className="space-y-1 text-sm">
                    {godparents.map((item) => (
                      <li key={item}>{bullet} {item}</li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          }

          case "witnesses": {
            const witnesses = parsePeopleList(inv.witnesses);
            if (!witnesses.length) return null;
            const bullet = getBulletPrefix(inv.witnessesBulletStyle);
            return (
              <section key="witnesses" className="py-14 px-6" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-6">Testigos</p>
                <div className="mx-auto max-w-3xl rounded-2xl bg-white/50 p-4">
                  <ul className="space-y-1 text-sm">
                    {witnesses.map((item) => (
                      <li key={item}>{bullet} {item}</li>
                    ))}
                  </ul>
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
                  <div className="mt-6 rounded-2xl overflow-hidden max-w-3xl mx-auto shadow-lg w-full" style={{ height: 450 }}>
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
                  <div className="mt-6 rounded-2xl overflow-hidden max-w-3xl mx-auto shadow-lg w-full" style={{ height: 450 }}>
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

          case "giftTable":
            if (!inv.giftTable) return null;
            return (
              <section key="giftTable" className="py-10 px-6 text-center" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 mb-3">Mesa de regalos</p>
                <p className="mx-auto max-w-2xl text-sm leading-relaxed whitespace-pre-line">{inv.giftTable}</p>
              </section>
            );

          case "dressCode":
            if (!inv.dressCode && !inv.dressCodeMen && !inv.dressCodeWomen) return null;
            return (
              <section key="dressCode" className="py-10 px-6 text-center" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Dress Code</p>
                {inv.dressCodeMen || inv.dressCodeWomen ? (
                  <div className="mx-auto mt-2 max-w-2xl space-y-2">
                    {inv.dressCodeMen ? <p className="text-lg"><span className="font-semibold">Dress code caballeros:</span> {inv.dressCodeMen}</p> : null}
                    {inv.dressCodeWomen ? <p className="text-lg"><span className="font-semibold">Dress code damas:</span> {inv.dressCodeWomen}</p> : null}
                  </div>
                ) : (
                  <p className="text-xl font-semibold">{inv.dressCode}</p>
                )}
              </section>
            );

          case "rsvp":
            return (
              <section key="rsvp" className="py-14 px-6" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-8">Confirma tu asistencia</p>
                <RsvpForm invitationId={inv.id} />
              </section>
            );

          case "tables": {
            const hasRows = (inv.tableAssignments?.length ?? 0) > 0;
            const hasPdf = !!inv.tablePdfUrl;
            if (!hasRows && !hasPdf) return null;
            return (
              <section key="tables" className="py-14 px-6 text-center">
                <p className="text-xs uppercase tracking-widest opacity-60 mb-6">Asignación de mesas</p>
                <div className="mx-auto max-w-sm">
                  <TableLookup
                    rows={inv.tableAssignments ?? []}
                    pdfUrl={inv.tablePdfUrl}
                    accentColor={accent}
                  />
                </div>
              </section>
            );
          }

          case "music":
            return null;

          default:
            return null;
        }
      })}

      {inv.commentsEnabled !== false && (
        <section className="py-14 px-6">
          <div className="mx-auto max-w-3xl">
            <CommentsSection invitationId={inv.id} allowPhotos={inv.commentsAllowPhotos !== false} />
          </div>
        </section>
      )}
    </main>
  );
}
