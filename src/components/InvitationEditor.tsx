"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import FontPicker from "./FontPicker";
import ImageUploader from "./ImageUploader";
import LoadingSpinner from "./LoadingSpinner";
import type { Invitation, EventType, ThemeStyle, SectionKey, TimelineItem, BulletStyle } from "@/types/invitation";
import { nanoid } from "nanoid";

const TableAssignmentEditor = dynamic(() => import("./TableAssignmentEditor"), { ssr: false });

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => <p className="text-xs text-gray-400">Cargando mapa...</p>,
});

type DraftInvitation = Omit<Invitation, "id" | "slug" | "ownerId" | "createdAt" | "updatedAt"> & {
  id?: string;
  slug?: string;
  eventTypeLabel: string;
  commentsEnabled: boolean;
  commentsAllowPhotos: boolean;
  customSections: Array<{ id: string; title: string; content: string }>;
  fullOrder: string[];
  tableAssignments: Array<{ dni: string; name: string; tableNumber: string }>;
  tablePdfUrl: string;
  fontFamily: string;
  fontSize: string;
};

const ALL_SECTIONS: SectionKey[] = [
  "hero", "details", "countdown", "timeline", "parents", "godparents", "witnesses", "parish", "reception", "gallery", "message", "giftTable", "dressCode", "rsvp", "music", "tables",
];

const SECTION_LABELS: Record<SectionKey, string> = {
  hero: "Portada principal",
  details: "Fecha, hora y lugar",
  countdown: "Cuenta regresiva",
  timeline: "Timeline / programacion",
  parents: "Bendicion de familias",
  godparents: "Padrinos",
  witnesses: "Testigos",
  parish: "Parroquia",
  reception: "Salon de recepciones",
  gallery: "Galeria de fotos",
  message: "Mensaje personalizado",
  giftTable: "Mesa de regalos",
  dressCode: "Dress code",
  rsvp: "Formulario RSVP",
  music: "Musica de fondo",
  tables: "Asignación de mesas",
};

const THEMES: Record<ThemeStyle, { label: string; bg: string; text: string; accent: string; card: string }> = {
  elegant: { label: "Elegante", bg: "#12192b", text: "#f0e6c8", accent: "#c9a84c", card: "#1e2d47" },
  romantic: { label: "Romantico", bg: "#fff0f3", text: "#5c2d45", accent: "#d4608a", card: "#ffe8ee" },
  modern: { label: "Moderno", bg: "#ffffff", text: "#111111", accent: "#1a1a1a", card: "#f5f5f5" },
  floral: { label: "Floral", bg: "#f8f4ef", text: "#3d3325", accent: "#7b9e6b", card: "#eee5d6" },
};

const EVENT_LABELS: Record<EventType, string> = {
  boda: "Boda",
  cumpleanos: "Cumpleaños",
  "baby-shower": "Baby Shower",
  graduacion: "Graduación",
  otro: "Otro evento",
};

const BULLET_LABELS: Record<BulletStyle, string> = {
  dot: "Punto (•)",
  circle: "Circulo (◦)",
  square: "Cuadrado (▪)",
  dash: "Guion (—)",
};

const DEFAULT_GALLERY = [
  "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1464692805480-a69dfaafdb0d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&w=1200&q=80",
];

function getDefaultDraft(): DraftInvitation {
  return {
    id: undefined,
    slug: undefined,
    eventType: "boda",
    title: "Ana & Carlos",
    subtitle: "Nos encantaria celebrar contigo este dia tan especial",
    heroImage: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1800&q=80",
    hostNames: "Familias Garcia y Lopez",
    dateTime: "2026-12-19T18:00",
    place: "Hacienda Villa Jardin",
    address: "Av. Primavera 1234, Lima",
    timeline: [
      { time: "7:00 AM", title: "Toma de fotos", description: "Sesión con familiares y padrinos" },
      { time: "8:00 AM", title: "Recepcion de invitados", description: "Bienvenida y coctel inicial" },
      { time: "9:00 AM", title: "Ceremonia", description: "Inicio del momento principal" },
    ],
    parents: "",
    brideParents: "Padre de la novia\nMadre de la novia",
    groomParents: "Padre del novio\nMadre del novio",
    parentsBulletStyle: "dot",
    godparents: "Padrinos de ceremonia",
    godparentsBulletStyle: "dot",
    witnesses: "Testigo 1\nTestigo 2",
    witnessesBulletStyle: "dot",
    parishName: "Parroquia San Pedro",
    parishTime: "11:00 AM",
    parishMapUrl: "https://maps.google.com/maps?q=-12.0464,-77.0428&output=embed&z=16",
    receptionName: "Salon Villa Dorada",
    receptionTime: "1:00 PM",
    receptionMapUrl: "https://maps.google.com/maps?q=-12.0505,-77.0332&output=embed&z=16",
    message: "Gracias por acompanarnos en el inicio de esta nueva etapa. Tu presencia hara este momento aun mas inolvidable.",
    giftTable: "Tu presencia es nuestro mejor regalo, pero si deseas tener un detalle con nosotros, aqui compartimos nuestra mesa de regalos.",
    gallery: DEFAULT_GALLERY,
    dressCode: "Formal elegante",
    dressCodeMen: "Terno oscuro",
    dressCodeWomen: "Vestido elegante",
    musicUrl: "",
    theme: "romantic",
    primaryColor: "#d4608a",
    textColor: "",
    eventTypeLabel: "",
    fontFamily: "",
    fontSize: "",
    sections: [...ALL_SECTIONS].filter(s => s !== "tables"),
    sectionOrder: [...ALL_SECTIONS].filter(s => s !== "tables"),
    commentsEnabled: true,
    commentsAllowPhotos: true,
    customSections: [],
    fullOrder: [...ALL_SECTIONS],
    tableAssignments: [],
    tablePdfUrl: "",
  };
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function normalizeSectionOrder(sections?: SectionKey[]) {
  const source = sections ?? [];
  const valid = ALL_SECTIONS.filter((item) => source.includes(item));
  const missing = ALL_SECTIONS.filter((item) => !valid.includes(item));
  return [...valid, ...missing];
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

function applySectionDefaults(draft: DraftInvitation, key: SectionKey): DraftInvitation {
  const defaults = getDefaultDraft();

  switch (key) {
    case "hero":
      return {
        ...draft,
        title: draft.title?.trim() ? draft.title : defaults.title,
        subtitle: draft.subtitle?.trim() ? draft.subtitle : defaults.subtitle,
        heroImage: draft.heroImage?.trim() ? draft.heroImage : defaults.heroImage,
      };

    case "details":
      return {
        ...draft,
        hostNames: draft.hostNames?.trim() ? draft.hostNames : defaults.hostNames,
        dateTime: draft.dateTime?.trim() ? draft.dateTime : defaults.dateTime,
        place: draft.place?.trim() ? draft.place : defaults.place,
        address: draft.address?.trim() ? draft.address : defaults.address,
      };

    case "countdown":
      return {
        ...draft,
        dateTime: draft.dateTime?.trim() ? draft.dateTime : defaults.dateTime,
      };

    case "timeline":
      return {
        ...draft,
        timeline: draft.timeline?.length ? draft.timeline : defaults.timeline,
      };

    case "parents":
      return {
        ...draft,
        brideParents: draft.brideParents?.trim() ? draft.brideParents : defaults.brideParents,
        groomParents: draft.groomParents?.trim() ? draft.groomParents : defaults.groomParents,
        parentsBulletStyle: draft.parentsBulletStyle ?? defaults.parentsBulletStyle,
      };

    case "godparents":
      return {
        ...draft,
        godparents: draft.godparents?.trim() ? draft.godparents : defaults.godparents,
        godparentsBulletStyle: draft.godparentsBulletStyle ?? defaults.godparentsBulletStyle,
      };

    case "witnesses":
      return {
        ...draft,
        witnesses: draft.witnesses?.trim() ? draft.witnesses : defaults.witnesses,
        witnessesBulletStyle: draft.witnessesBulletStyle ?? defaults.witnessesBulletStyle,
      };

    case "parish":
      return {
        ...draft,
        parishName: draft.parishName?.trim() ? draft.parishName : defaults.parishName,
        parishTime: draft.parishTime?.trim() ? draft.parishTime : defaults.parishTime,
        parishMapUrl: draft.parishMapUrl?.trim() ? draft.parishMapUrl : defaults.parishMapUrl,
      };

    case "reception":
      return {
        ...draft,
        receptionName: draft.receptionName?.trim() ? draft.receptionName : defaults.receptionName,
        receptionTime: draft.receptionTime?.trim() ? draft.receptionTime : defaults.receptionTime,
        receptionMapUrl: draft.receptionMapUrl?.trim() ? draft.receptionMapUrl : defaults.receptionMapUrl,
      };

    case "gallery":
      return {
        ...draft,
        gallery: draft.gallery?.length ? draft.gallery : defaults.gallery,
      };

    case "message":
      return {
        ...draft,
        message: draft.message?.trim() ? draft.message : defaults.message,
      };

    case "giftTable":
      return {
        ...draft,
        giftTable: draft.giftTable?.trim() ? draft.giftTable : defaults.giftTable,
      };

    case "dressCode":
      return {
        ...draft,
        dressCode: draft.dressCode?.trim() ? draft.dressCode : defaults.dressCode,
        dressCodeMen: draft.dressCodeMen?.trim() ? draft.dressCodeMen : defaults.dressCodeMen,
        dressCodeWomen: draft.dressCodeWomen?.trim() ? draft.dressCodeWomen : defaults.dressCodeWomen,
      };

    case "music":
      return {
        ...draft,
        musicUrl: draft.musicUrl?.trim() ? draft.musicUrl : defaults.musicUrl,
      };

    case "rsvp":
    default:
      return draft;
  }
}

function formatDate(iso: string) {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    const weekdays = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];

    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${weekday}, ${day} de ${month} de ${year}, ${hours}:${minutes}`;
  } catch {
    return iso;
  }
}

// ----- Preview ----------------------------------------------------------------
function PagePreview({ draft }: { draft: DraftInvitation }) {
  const theme = THEMES[draft.theme] ?? THEMES.elegant;
  const accent = draft.primaryColor || theme.accent;
  const activeGallery = (draft.gallery ?? []).filter(Boolean);
  const customSectionsById = Object.fromEntries((draft.customSections ?? []).map(cs => [cs.id, cs]));

  const style = {
    "--th-bg": theme.bg,
    "--th-text": draft.textColor || theme.text,
    "--th-accent": accent,
    "--th-card": theme.card,
  } as React.CSSProperties;

  const fontFamily = draft.fontFamily || "Georgia, serif";
  const zoom = draft.fontSize ? Number(draft.fontSize) : undefined;

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-2xl"
      style={{ ...style, background: "var(--th-bg)", color: "var(--th-text)", fontFamily, zoom }}
    >
      {draft.fullOrder.map((item) => {
        if (!(ALL_SECTIONS as string[]).includes(item)) {
          const cs = customSectionsById[item];
          if (!cs?.content) return null;
          return (
            <section key={item} className="py-6 px-4 text-center" style={{ background: "var(--th-card)" }}>
              {cs.title ? <p className="text-xs uppercase tracking-widest opacity-60 mb-2">{cs.title}</p> : null}
              <p className="text-sm leading-relaxed whitespace-pre-line opacity-90 max-w-xs mx-auto">{cs.content}</p>
            </section>
          );
        }
        const key = item as SectionKey;
        if (!draft.sections.includes(key)) return null;
        switch (key) {
          case "hero":
            return (
              <section
                key="hero"
                className="relative flex flex-col items-center justify-center py-20 px-6 text-center min-h-[220px]"
                style={{
                  background: draft.heroImage
                    ? `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.55)),url(${draft.heroImage}) center/cover no-repeat`
                    : `linear-gradient(135deg,var(--th-card),var(--th-bg))`,
                  color: draft.heroImage ? "#fff" : "var(--th-text)",
                }}
              >
                <p className="text-xs uppercase tracking-widest mb-2 opacity-70">{draft.eventTypeLabel || EVENT_LABELS[draft.eventType]}</p>
                <h1 className="text-3xl font-bold mb-2">{draft.title || "Titulo del evento"}</h1>
                {draft.subtitle && <p className="text-base opacity-80 max-w-xs whitespace-pre-line">{draft.subtitle}</p>}
              </section>
            );

          case "details":
            if (!draft.hostNames && !draft.dateTime && !draft.place) return null;
            return (
              <section key="details" className="py-8 px-6 text-center" style={{ background: "var(--th-card)" }}>
                {draft.hostNames && <p className="text-lg font-semibold mb-3">{draft.hostNames}</p>}
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  {draft.dateTime && (
                    <div>
                      <p className="uppercase tracking-wider text-xs opacity-60 mb-1">Fecha y hora</p>
                      <p>{formatDate(draft.dateTime)}</p>
                    </div>
                  )}
                  {draft.place && (
                    <div>
                      <p className="uppercase tracking-wider text-xs opacity-60 mb-1">Lugar</p>
                      <p>{draft.place}</p>
                      {draft.address && <p className="opacity-60 text-xs">{draft.address}</p>}
                    </div>
                  )}
                </div>
              </section>
            );

          case "countdown":
            return (
              <section key="countdown" className="py-8 px-6 text-center">
                <p className="text-xs uppercase tracking-widest opacity-60 mb-4">Cuenta regresiva</p>
                <div className="flex justify-center gap-4">
                  {["dias", "horas", "min", "seg"].map((u) => (
                    <div key={u} className="text-center">
                      <div className="text-2xl font-bold rounded-lg px-3 py-2" style={{ background: "var(--th-card)" }}>
                        --
                      </div>
                      <p className="text-xs opacity-60 mt-1">{u}</p>
                    </div>
                  ))}
                </div>
              </section>
            );

          case "timeline":
            if (!draft.timeline?.length) return null;
            return (
              <section key="timeline" className="py-8 px-6" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-4">Programacion del evento</p>
                <div className="mx-auto max-w-md space-y-3">
                  {draft.timeline.map((item, index) => (
                    <div key={`${item.time}-${item.title}-${index}`} className="grid grid-cols-[84px_1fr] gap-3 rounded-xl bg-white/10 px-3 py-3">
                      <div className="text-sm font-semibold" style={{ color: "var(--th-accent)" }}>{item.time || "--:--"}</div>
                      <div>
                        <p className="text-sm font-semibold">{item.title || "Actividad"}</p>
                        {item.description ? <p className="mt-1 text-xs opacity-70">{item.description}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case "parents": {
            const legacyParents = parsePeopleList(draft.parents);
            const brideParents = parsePeopleList(draft.brideParents || (legacyParents.length ? draft.parents : ""));
            const groomParents = parsePeopleList(draft.groomParents);
            if (!brideParents.length && !groomParents.length) return null;
            const bullet = getBulletPrefix(draft.parentsBulletStyle);
            return (
              <section key="parents" className="py-8 px-6" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-4">CON LA BENDICION DE NUESTRAS FAMILIAS:</p>
                <div className="mx-auto max-w-xl space-y-3 rounded-xl bg-white/10 p-4">
                  {brideParents.length ? (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider opacity-70">Padres de la novia</p>
                      {brideParents.map((item) => <p key={`bride-${item}`} className="text-sm">{bullet} {item}</p>)}
                    </div>
                  ) : null}
                  {groomParents.length ? (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider opacity-70">Padres del novio</p>
                      {groomParents.map((item) => <p key={`groom-${item}`} className="text-sm">{bullet} {item}</p>)}
                    </div>
                  ) : null}
                </div>
              </section>
            );
          }

          case "godparents": {
            const items = parsePeopleList(draft.godparents);
            if (!items.length) return null;
            const bullet = getBulletPrefix(draft.godparentsBulletStyle);
            return (
              <section key="godparents" className="py-8 px-6" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-4">Padrinos</p>
                <div className="mx-auto max-w-xl rounded-xl bg-white/10 p-4">
                  {items.map((item) => <p key={item} className="text-sm">{bullet} {item}</p>)}
                </div>
              </section>
            );
          }

          case "witnesses": {
            const items = parsePeopleList(draft.witnesses);
            if (!items.length) return null;
            const bullet = getBulletPrefix(draft.witnessesBulletStyle);
            return (
              <section key="witnesses" className="py-8 px-6" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-4">Testigos</p>
                <div className="mx-auto max-w-xl rounded-xl bg-white/10 p-4">
                  {items.map((item) => <p key={item} className="text-sm">{bullet} {item}</p>)}
                </div>
              </section>
            );
          }

          case "parish":
            if (!draft.parishName && !draft.parishTime && !draft.parishMapUrl) return null;
            return (
              <section key="parish" className="py-6 px-6">
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-2">Parroquia</p>
                {draft.parishName ? <p className="text-center text-base font-semibold">{draft.parishName}</p> : null}
                {draft.parishTime ? <p className="text-center text-xs opacity-70 mt-1">Hora: {draft.parishTime}</p> : null}
                {draft.parishMapUrl ? (
                  <div className="rounded-xl overflow-hidden w-full mt-3" style={{ height: 150, background: "var(--th-card)" }}>
                    <iframe src={draft.parishMapUrl} className="w-full h-full border-0" title="Mapa de parroquia" />
                  </div>
                ) : null}
              </section>
            );

          case "reception":
            if (!draft.receptionName && !draft.receptionTime && !draft.receptionMapUrl) return null;
            return (
              <section key="reception" className="py-6 px-6" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-2">Salon de recepciones</p>
                {draft.receptionName ? <p className="text-center text-base font-semibold">{draft.receptionName}</p> : null}
                {draft.receptionTime ? <p className="text-center text-xs opacity-70 mt-1">Hora: {draft.receptionTime}</p> : null}
                {draft.receptionMapUrl ? (
                  <div className="rounded-xl overflow-hidden w-full mt-3" style={{ height: 150, background: "var(--th-bg)" }}>
                    <iframe src={draft.receptionMapUrl} className="w-full h-full border-0" title="Mapa de salon" />
                  </div>
                ) : null}
              </section>
            );

          case "gallery":
            if (!activeGallery.length) return null;
            return (
              <section key="gallery" className="py-8 px-4">
                <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-4">Galeria</p>
                <div className="grid grid-cols-3 gap-2">
                  {activeGallery.slice(0, 9).map((src, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden" style={{ background: "var(--th-card)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            );

          case "message":
            if (!draft.message) return null;
            return (
              <section key="message" className="py-10 px-8 text-center">
                <p className="italic text-base leading-relaxed opacity-90 max-w-md mx-auto">
                  &ldquo;{draft.message}&rdquo;
                </p>
              </section>
            );

          case "giftTable":
            if (!draft.giftTable) return null;
            return (
              <section key="giftTable" className="py-8 px-6 text-center" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 mb-3">Mesa de regalos</p>
                <p className="mx-auto max-w-lg text-sm leading-relaxed whitespace-pre-line">{draft.giftTable}</p>
              </section>
            );

          case "dressCode":
            if (!draft.dressCode && !draft.dressCodeMen && !draft.dressCodeWomen) return null;
            return (
              <section key="dressCode" className="py-6 px-6 text-center" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Dress Code</p>
                {draft.dressCodeMen || draft.dressCodeWomen ? (
                  <div className="mx-auto mt-2 max-w-lg space-y-1">
                    {draft.dressCodeMen ? <p className="text-sm"><span className="font-semibold">Caballeros:</span> {draft.dressCodeMen}</p> : null}
                    {draft.dressCodeWomen ? <p className="text-sm"><span className="font-semibold">Damas:</span> {draft.dressCodeWomen}</p> : null}
                  </div>
                ) : (
                  <p className="text-base font-semibold">{draft.dressCode}</p>
                )}
              </section>
            );

          case "rsvp":
            return (
              <section key="rsvp" className="py-8 px-6 text-center" style={{ background: "var(--th-card)" }}>
                <p className="text-xs uppercase tracking-widest opacity-60 mb-4">Confirma tu asistencia</p>
                <div className="max-w-xs mx-auto space-y-2">
                  <div className="h-8 rounded-lg opacity-30" style={{ background: "var(--th-bg)" }} />
                  <div className="h-8 rounded-lg opacity-30" style={{ background: "var(--th-bg)" }} />
                  <div className="h-9 rounded-lg" style={{ background: accent }} />
                </div>
              </section>
            );

          case "tables":
            return (
              <section key="tables" className="py-8 px-4 text-center">
                <p className="text-xs uppercase tracking-widest opacity-60 mb-3">Asignación de mesas</p>
                <div className="mx-auto max-w-xs space-y-2">
                  <div className="h-8 rounded-xl bg-white/20 flex items-center px-3 gap-2">
                    <div className="h-3 w-3/4 rounded bg-white/30" />
                  </div>
                  <div className="h-8 rounded-xl opacity-60" style={{ background: accent }} />
                </div>
              </section>
            );

          case "music":
            if (!draft.musicUrl) return null;
            return (
              <section key="music" className="py-4 px-6 text-center text-xs opacity-60">
                ♫ Musica de fondo activa
              </section>
            );

          default:
            return null;
        }
      })}

      {/* Mockup de seccion de comentarios */}
      {draft.commentsEnabled !== false && (
      <section className="py-8 px-4" style={{ background: "var(--th-card)" }}>
        <p className="text-xs uppercase tracking-widest opacity-60 text-center mb-4">Comentarios</p>
        <div className="space-y-2 max-w-sm mx-auto">
          <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2">
            <div className="h-7 w-7 flex-shrink-0 rounded-full bg-white/30" />
            <div className="h-4 flex-1 rounded-full bg-white/20" />
          </div>
          <div className="flex items-start gap-2">
            <div className="h-7 w-7 flex-shrink-0 rounded-full bg-white/20" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-24 rounded bg-white/30" />
              <div className="h-3 w-full rounded bg-white/20" />
              <div className="h-3 w-3/4 rounded bg-white/20" />
            </div>
          </div>
        </div>
      </section>
      )}
    </div>
  );
}

// ----- Section accordion ------------------------------------------------------
function SectionPanel({
  id,
  label,
  enabled,
  onToggle,
  showToggle = true,
  onDelete,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDropTarget,
  children,
}: {
  id: string;
  label: string;
  enabled: boolean;
  onToggle: () => void;
  showToggle?: boolean;
  onDelete?: () => void;
  draggable: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragOver={draggable ? (event) => {
        event.preventDefault();
        onDragOver();
      } : undefined}
      onDrop={draggable ? (event) => {
        event.preventDefault();
        onDrop();
      } : undefined}
      className={`rounded-xl border bg-white overflow-hidden transition ${isDragging ? "opacity-50" : "opacity-100"} ${isDropTarget ? "border-indigo-400 ring-2 ring-indigo-200" : "border-gray-200"}`}
    >
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="cursor-grab text-gray-400 active:cursor-grabbing" aria-hidden="true">⋮⋮</span>
          {showToggle ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${enabled ? "bg-indigo-500" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </button>
          ) : null}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          {onDelete ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Eliminar sección"
              aria-label="Eliminar sección"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
              </svg>
            </button>
          ) : null}
          <span className="text-gray-400 text-xs px-1">{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (enabled || !showToggle) && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}

// ----- Field helpers ----------------------------------------------------------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

// ----- Main editor ------------------------------------------------------------
export default function InvitationEditor({ initial }: { initial?: Invitation }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [draggingSection, setDraggingSection] = useState<string | null>(null);
  const [dropTargetSection, setDropTargetSection] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>("");

  const [draft, setDraft] = useState<DraftInvitation>(() => {
    if (!initial) {
      return getDefaultDraft();
    }

    return {
      id: initial.id,
      slug: initial.slug,
      eventType: initial.eventType ?? "boda",
      eventTypeLabel: initial.eventTypeLabel ?? "",
      title: initial.title ?? "",
      subtitle: initial.subtitle ?? "",
      heroImage: initial.heroImage ?? "",
      hostNames: initial.hostNames ?? "",
      dateTime: initial.dateTime ?? "",
      place: initial.place ?? "",
      address: initial.address ?? "",
      timeline: initial.timeline ?? [],
      parents: initial.parents ?? "",
      brideParents: initial.brideParents ?? "",
      groomParents: initial.groomParents ?? "",
      parentsBulletStyle: initial.parentsBulletStyle ?? "dot",
      godparents: initial.godparents ?? "",
      godparentsBulletStyle: initial.godparentsBulletStyle ?? "dot",
      witnesses: initial.witnesses ?? "",
      witnessesBulletStyle: initial.witnessesBulletStyle ?? "dot",
      parishName: initial.parishName ?? "",
      parishTime: initial.parishTime ?? "",
      parishMapUrl: initial.parishMapUrl ?? "",
      receptionName: initial.receptionName ?? "",
      receptionTime: initial.receptionTime ?? "",
      receptionMapUrl: initial.receptionMapUrl ?? "",
      message: initial.message ?? "",
      giftTable: initial.giftTable ?? "",
      gallery: initial.gallery ?? [],
      dressCode: initial.dressCode ?? "",
      dressCodeMen: initial.dressCodeMen ?? "",
      dressCodeWomen: initial.dressCodeWomen ?? "",
      musicUrl: initial.musicUrl ?? "",
      theme: initial.theme ?? "elegant",
      primaryColor: initial.primaryColor ?? "",
      textColor: initial.textColor ?? "",
      fontFamily: initial.fontFamily ?? "",
      fontSize: initial.fontSize ?? "",
      sections: (initial.sections ?? [...ALL_SECTIONS]).filter((section) => ALL_SECTIONS.includes(section)),
      sectionOrder: normalizeSectionOrder(initial.sectionOrder ?? initial.sections),
      commentsEnabled: initial.commentsEnabled ?? true,
      commentsAllowPhotos: initial.commentsAllowPhotos ?? true,
      customSections: initial.customSections ?? [],
      fullOrder: (() => {
        const baseOrder: string[] = initial.fullOrder?.length
          ? initial.fullOrder
          : normalizeSectionOrder(initial.sectionOrder ?? initial.sections);
        // Asegurar que 'tables' siempre esté en el order (puede estar deshabilitado)
        if (!baseOrder.includes("tables")) baseOrder.push("tables");
        const customIds = (initial.customSections ?? []).map(cs => cs.id);
        const missingIds = customIds.filter(id => !baseOrder.includes(id));
        return [...baseOrder, ...missingIds];
      })(),
      tableAssignments: initial.tableAssignments ?? [],
      tablePdfUrl: initial.tablePdfUrl ?? "",
    };
  });

  const set = useCallback(<K extends keyof DraftInvitation>(key: K, value: DraftInvitation[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  const toggleSection = useCallback((key: SectionKey) => {
    setDraft((d) => {
      if (d.sections.includes(key)) {
        return {
          ...d,
          sections: d.sections.filter((s) => s !== key),
        };
      }

      const withSectionEnabled = {
        ...d,
        sections: [...d.sections, key],
      };

      return applySectionDefaults(withSectionEnabled, key);
    });
  }, []);

  const reorderSections = useCallback((fromKey: string, toKey: string) => {
    if (fromKey === toKey) return;

    setDraft((d) => {
      const source = d.fullOrder.length ? d.fullOrder : [...ALL_SECTIONS];
      const fromIndex = source.indexOf(fromKey);
      const toIndex = source.indexOf(toKey);

      if (fromIndex === -1 || toIndex === -1) {
        return d;
      }

      return {
        ...d,
        fullOrder: moveItem(source, fromIndex, toIndex),
      };
    });
  }, []);

  const updateTimelineItem = (index: number, key: keyof TimelineItem, value: string) => {
    setDraft((d) => ({
      ...d,
      timeline: (d.timeline ?? []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addTimelineItem = () => {
    setDraft((d) => ({
      ...d,
      timeline: [...(d.timeline ?? []), { time: "", title: "", description: "" }],
    }));
  };

  const removeTimelineItem = (index: number) => {
    setDraft((d) => ({
      ...d,
      timeline: (d.timeline ?? []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addCustomSection = () => {
    const id = `custom_${nanoid(8)}`;
    setDraft((d) => ({
      ...d,
      customSections: [...(d.customSections ?? []), { id, title: "", content: "" }],
      fullOrder: [...(d.fullOrder.length ? d.fullOrder : [...ALL_SECTIONS]), id],
    }));
  };

  const updateCustomSection = (id: string, key: "title" | "content", value: string) => {
    setDraft((d) => ({
      ...d,
      customSections: (d.customSections ?? []).map((cs) => cs.id === id ? { ...cs, [key]: value } : cs),
    }));
  };

  const removeCustomSection = (id: string) => {
    setDraft((d) => ({
      ...d,
      customSections: (d.customSections ?? []).filter((cs) => cs.id !== id),
      fullOrder: (d.fullOrder ?? []).filter((item) => item !== id),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        ...draft,
        sectionOrder: draft.fullOrder.filter(item => (ALL_SECTIONS as string[]).includes(item)) as SectionKey[],
      };
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errorMessage = "No se pudo guardar la pagina. Revisa los datos ingresados.";
        try {
          const payload = await res.json() as {
            error?: string;
            details?: {
              fieldErrors?: Record<string, string[]>;
            };
          };

          const fieldErrors = payload.details?.fieldErrors ?? {};
          const firstFieldWithError = Object.keys(fieldErrors).find((key) => fieldErrors[key]?.length);

          if (firstFieldWithError) {
            const firstFieldError = fieldErrors[firstFieldWithError]?.[0];
            if (firstFieldError) {
              errorMessage = firstFieldError;
            }
          } else if (payload.error) {
            errorMessage = payload.error;
          }
        } catch {
          // Si no viene JSON, dejamos mensaje amigable por defecto.
        }

        setFormError(errorMessage);
        return;
      }

      const data = await res.json();
      const saved: Invitation = data.invitation ?? data;
      if (!draft.id) {
        router.replace(`/editor?id=${saved.id}`);
        setDraft((d) => ({ ...d, id: saved.id, slug: saved.slug }));
      }
      alert("Guardado correctamente");
    } catch {
      setFormError("Error de red al guardar. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = draft.slug ? `/i/${draft.slug}` : null;

  return (
    <div className="grid gap-4 md:grid-cols-[420px_1fr]" style={{ height: "auto" }}>
      {/* Left: controls */}
      <aside className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3 md:sticky md:top-4">
        {/* Theme */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tema visual</h2>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(THEMES) as ThemeStyle[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("theme", t)}
                className={`rounded-lg px-3 py-2 text-xs font-medium border transition-all ${
                  draft.theme === t
                    ? "ring-2 ring-indigo-400 border-indigo-500"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
                style={{ background: THEMES[t].bg, color: THEMES[t].text }}
              >
                {THEMES[t].label}
              </button>
            ))}
          </div>
          <Field label="Color de texto">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={draft.textColor || THEMES[draft.theme]?.text || "#000000"}
                onChange={(e) => set("textColor", e.target.value)}
                className="w-10 h-8 rounded cursor-pointer border"
              />
              {draft.textColor ? (
                <button
                  type="button"
                  onClick={() => set("textColor", "")}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Restablecer
                </button>
              ) : (
                <span className="text-xs text-gray-400">Usa el color del tema</span>
              )}
            </div>
          </Field>
          <Field label="Tipo de fuente">
            <FontPicker
              value={draft.fontFamily || ""}
              onChange={(val) => set("fontFamily", val)}
            />
          </Field>
        </div>

        {/* Tipo de evento */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <Field label="Tipo de evento">
            <select
              value={draft.eventType}
              onChange={(e) => {
                set("eventType", e.target.value as EventType);
                // Solo resetear label si el usuario no había personalizado nada
                if (!draft.eventTypeLabel) set("eventTypeLabel", "");
              }}
              className={inputCls}
            >
              {(Object.keys(EVENT_LABELS) as EventType[]).map((k) => (
                <option key={k} value={k}>{EVENT_LABELS[k]}</option>
              ))}
            </select>
          </Field>
          <Field label="Etiqueta personalizada (opcional)">
            <input
              type="text"
              maxLength={80}
              className={inputCls}
              placeholder={EVENT_LABELS[draft.eventType]}
              value={draft.eventTypeLabel}
              onChange={(e) => set("eventTypeLabel", e.target.value)}
            />
            <span className="text-xs text-gray-400 mt-1 block">Deja en blanco para usar el nombre del tipo seleccionado.</span>
          </Field>
        </div>

        {/* Sections */}
        <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 px-4 py-3 text-xs text-gray-500">
          Arrastra las secciones desde el icono de puntos para cambiar el orden en la pagina publica y en la vista previa.
        </div>

        {draft.fullOrder.map((item) => {
          const isCustom = !(ALL_SECTIONS as string[]).includes(item);
          if (isCustom) {
            const cs = draft.customSections.find(c => c.id === item);
            if (!cs) return null;
            return (
              <SectionPanel
                key={item}
                id={item}
                label={cs.title || "Sección personalizada"}
                enabled={true}
                showToggle={false}
                onToggle={() => {}}
                onDelete={() => removeCustomSection(item)}
                draggable
                onDragStart={() => { setDraggingSection(item); setDropTargetSection(null); }}
                onDragOver={() => { if (draggingSection && draggingSection !== item) setDropTargetSection(item); }}
                onDrop={() => { if (draggingSection) reorderSections(draggingSection, item); setDraggingSection(null); setDropTargetSection(null); }}
                isDragging={draggingSection === item}
                isDropTarget={dropTargetSection === item}
              >
                <Field label="Título de la sección (opcional)">
                  <input
                    className={inputCls}
                    maxLength={120}
                    value={cs.title}
                    onChange={(e) => updateCustomSection(item, "title", e.target.value)}
                    placeholder="Ej: Nota especial, Indicaciones..."
                  />
                </Field>
                <Field label="Contenido">
                  <textarea
                    className={`${inputCls} min-h-[80px] resize-y`}
                    maxLength={2000}
                    value={cs.content}
                    onChange={(e) => updateCustomSection(item, "content", e.target.value)}
                    placeholder="Escribe el mensaje aquí..."
                  />
                </Field>
              </SectionPanel>
            );
          }
          const key = item as SectionKey;
          return (
            <SectionPanel
              key={key}
              id={key}
              label={SECTION_LABELS[key]}
              enabled={draft.sections.includes(key)}
              onToggle={() => toggleSection(key)}
              draggable
              onDragStart={() => {
                setDraggingSection(key);
                setDropTargetSection(null);
              }}
              onDragOver={() => {
                if (draggingSection && draggingSection !== key) {
                  setDropTargetSection(key);
                }
              }}
              onDrop={() => {
                if (draggingSection) {
                  reorderSections(draggingSection, key);
                }
                setDraggingSection(null);
                setDropTargetSection(null);
              }}
              isDragging={draggingSection === key}
              isDropTarget={dropTargetSection === key}
            >
            {key === "hero" && (
              <>
                <Field label="Titulo principal *">
                  <input className={inputCls} value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Ej: La boda de Ana y Carlos" />
                </Field>
                <Field label="Subtitulo">
                  <div className="space-y-1">
                    <textarea
                      className={`${inputCls} min-h-[92px] resize-y rounded-xl`}
                      maxLength={200}
                      value={draft.subtitle ?? ""}
                      onChange={(e) => set("subtitle", e.target.value)}
                      placeholder={`Un mensaje de bienvenida\ncon más de una línea`}
                    />
                    <p className="text-[11px] text-gray-500">Puedes usar Enter para saltos de línea.</p>
                  </div>
                </Field>
                <ImageUploader
                  label="Imagen de portada"
                  value={draft.heroImage ?? ""}
                  onChange={(url) => set("heroImage", url)}
                />
              </>
            )}
            {key === "details" && (
              <>
                <Field label="Anfitriones">
                  <input className={inputCls} maxLength={450} value={draft.hostNames ?? ""} onChange={(e) => set("hostNames", e.target.value)} placeholder="Ana Garcia & Carlos Lopez" />
                </Field>
                <Field label="Fecha y hora">
                  <input type="datetime-local" className={inputCls} value={draft.dateTime ?? ""} onChange={(e) => set("dateTime", e.target.value)} />
                </Field>
                <Field label="Nombre del lugar">
                  <input className={inputCls} maxLength={450} value={draft.place ?? ""} onChange={(e) => set("place", e.target.value)} placeholder="Hotel Marriott Lima" />
                </Field>
                <Field label="Direccion">
                  <input className={inputCls} value={draft.address ?? ""} onChange={(e) => set("address", e.target.value)} placeholder="Av. Principal 123, Lima" />
                </Field>
              </>
            )}
            {key === "countdown" && (
              <p className="text-xs text-gray-500">La cuenta regresiva se calcula automaticamente desde la fecha del evento.</p>
            )}
            {key === "timeline" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Agrega los momentos importantes de la programacion del evento.</p>
                {(draft.timeline ?? []).map((item, index) => (
                  <div key={`timeline-${index}`} className="space-y-2 rounded-lg border border-gray-200 bg-white p-3">
                    <div className="grid gap-2 md:grid-cols-2">
                      <Field label="Hora">
                        <input
                          className={inputCls}
                          maxLength={40}
                          value={item.time}
                          onChange={(e) => updateTimelineItem(index, "time", e.target.value)}
                          placeholder="Ej: 7:00 AM"
                        />
                      </Field>
                      <Field label="Actividad">
                        <input
                          className={inputCls}
                          maxLength={120}
                          value={item.title}
                          onChange={(e) => updateTimelineItem(index, "title", e.target.value)}
                          placeholder="Ej: Toma de fotos"
                        />
                      </Field>
                    </div>
                    <Field label="Descripcion opcional">
                      <input
                        className={inputCls}
                        maxLength={240}
                        value={item.description ?? ""}
                        onChange={(e) => updateTimelineItem(index, "description", e.target.value)}
                        placeholder="Ej: Sesion con familia y amigos cercanos"
                      />
                    </Field>
                    <button
                      type="button"
                      onClick={() => removeTimelineItem(index)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Eliminar bloque
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimelineItem}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
                >
                  Agregar item al timeline
                </button>
              </div>
            )}
            {key === "parents" && (
              <div className="space-y-3">
                <Field label="Tipo de viñeta">
                  <select
                    className={inputCls}
                    value={draft.parentsBulletStyle ?? "dot"}
                    onChange={(e) => set("parentsBulletStyle", e.target.value as BulletStyle)}
                  >
                    {(Object.keys(BULLET_LABELS) as BulletStyle[]).map((style) => (
                      <option key={style} value={style}>{BULLET_LABELS[style]}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Padres de la novia (un nombre por linea)">
                  <textarea
                    className={`${inputCls} h-20 resize-none`}
                    maxLength={450}
                    value={draft.brideParents ?? ""}
                    onChange={(e) => set("brideParents", e.target.value)}
                    placeholder={`Padre de la novia\nMadre de la novia`}
                  />
                </Field>
                <Field label="Padres del novio (un nombre por linea)">
                  <textarea
                    className={`${inputCls} h-20 resize-none`}
                    maxLength={450}
                    value={draft.groomParents ?? ""}
                    onChange={(e) => set("groomParents", e.target.value)}
                    placeholder={`Padre del novio\nMadre del novio`}
                  />
                </Field>
              </div>
            )}
            {key === "godparents" && (
              <div className="space-y-3">
                <Field label="Tipo de viñeta">
                  <select
                    className={inputCls}
                    value={draft.godparentsBulletStyle ?? "dot"}
                    onChange={(e) => set("godparentsBulletStyle", e.target.value as BulletStyle)}
                  >
                    {(Object.keys(BULLET_LABELS) as BulletStyle[]).map((style) => (
                      <option key={style} value={style}>{BULLET_LABELS[style]}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Padrinos (un nombre por linea)">
                  <textarea
                    className={`${inputCls} h-20 resize-none`}
                    maxLength={450}
                    value={draft.godparents ?? ""}
                    onChange={(e) => set("godparents", e.target.value)}
                    placeholder={`Padrino 1\nPadrino 2`}
                  />
                </Field>
              </div>
            )}
            {key === "witnesses" && (
              <div className="space-y-3">
                <Field label="Tipo de viñeta">
                  <select
                    className={inputCls}
                    value={draft.witnessesBulletStyle ?? "dot"}
                    onChange={(e) => set("witnessesBulletStyle", e.target.value as BulletStyle)}
                  >
                    {(Object.keys(BULLET_LABELS) as BulletStyle[]).map((style) => (
                      <option key={style} value={style}>{BULLET_LABELS[style]}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Testigos (un nombre por linea)">
                  <textarea
                    className={`${inputCls} h-20 resize-none`}
                    maxLength={450}
                    value={draft.witnesses ?? ""}
                    onChange={(e) => set("witnesses", e.target.value)}
                    placeholder={`Testigo 1\nTestigo 2`}
                  />
                </Field>
              </div>
            )}
            {key === "parish" && (
              <div className="space-y-3">
                <Field label="Nombre de la parroquia">
                  <input className={inputCls} maxLength={450} value={draft.parishName ?? ""} onChange={(e) => set("parishName", e.target.value)} placeholder="Parroquia San Pedro" />
                </Field>
                <Field label="Hora en parroquia">
                  <input className={inputCls} maxLength={40} value={draft.parishTime ?? ""} onChange={(e) => set("parishTime", e.target.value)} placeholder="Ej: 11:00 AM" />
                </Field>
                <MapPicker
                  value={draft.parishMapUrl ?? ""}
                  onChange={(embedUrl) => {
                    set("parishMapUrl", embedUrl);
                  }}
                />
              </div>
            )}
            {key === "reception" && (
              <div className="space-y-3">
                <Field label="Nombre del salon de recepciones">
                  <input className={inputCls} maxLength={450} value={draft.receptionName ?? ""} onChange={(e) => set("receptionName", e.target.value)} placeholder="Salon Villa Dorada" />
                </Field>
                <Field label="Hora en salon">
                  <input className={inputCls} maxLength={40} value={draft.receptionTime ?? ""} onChange={(e) => set("receptionTime", e.target.value)} placeholder="Ej: 1:00 PM" />
                </Field>
                <MapPicker
                  value={draft.receptionMapUrl ?? ""}
                  onChange={(embedUrl) => {
                    set("receptionMapUrl", embedUrl);
                  }}
                />
              </div>
            )}
            {key === "gallery" && (
              <ImageUploader
                label="Fotos de la galeria (puedes subir varias a la vez)"
                multiple
                value={draft.gallery ?? []}
                onChange={(urls) => set("gallery", urls)}
              />
            )}
            {key === "message" && (
              <Field label="Mensaje para los invitados">
                <textarea
                  className={`${inputCls} h-24 resize-none`}
                  value={draft.message ?? ""}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Escribe un mensaje especial..."
                />
              </Field>
            )}
            {key === "giftTable" && (
              <Field label="Contenido de mesa de regalos">
                <textarea
                  className={`${inputCls} h-24 resize-none`}
                  maxLength={450}
                  value={draft.giftTable ?? ""}
                  onChange={(e) => set("giftTable", e.target.value)}
                  placeholder="Comparte aqui enlaces, datos o instrucciones para la mesa de regalos"
                />
              </Field>
            )}
            {key === "dressCode" && (
              <div className="space-y-3">
                <Field label="Dress code caballeros">
                  <input className={inputCls} maxLength={120} value={draft.dressCodeMen ?? ""} onChange={(e) => set("dressCodeMen", e.target.value)} placeholder="Ej: Terno oscuro" />
                </Field>
                <Field label="Dress code damas">
                  <input className={inputCls} maxLength={120} value={draft.dressCodeWomen ?? ""} onChange={(e) => set("dressCodeWomen", e.target.value)} placeholder="Ej: Vestido elegante" />
                </Field>
              </div>
            )}
            {key === "rsvp" && (
              <p className="text-xs text-gray-500">El formulario RSVP se activa automaticamente para los invitados en la pagina publica.</p>
            )}
            {key === "music" && (
              <Field label="URL del audio de fondo (MP3/OGG)">
                <input className={inputCls} value={draft.musicUrl ?? ""} onChange={(e) => set("musicUrl", e.target.value)} placeholder="https://youtu.be/ID o https://example.com/cancion.mp3" />
                <span className="text-xs text-gray-400 mt-1 block">Acepta URLs de YouTube o enlaces directos a MP3/OGG.</span>
              </Field>
            )}
            {key === "tables" && (
              <TableAssignmentEditor
                rows={draft.tableAssignments}
                pdfUrl={draft.tablePdfUrl}
                onChangeRows={(rows) => set("tableAssignments", rows)}
                onChangePdf={(url) => set("tablePdfUrl", url)}
              />
            )}
          </SectionPanel>
          );
        })}

        {/* Agregar sección personalizada */}
        {(draft.customSections ?? []).length < 10 && (
          <button
            type="button"
            onClick={addCustomSection}
            className="w-full rounded-xl border border-dashed border-gray-300 bg-white py-3 text-sm font-medium text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            + Agregar sección personalizada
          </button>
        )}

        {/* Configuracion de comentarios */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Comentarios</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Mostrar sección de comentarios</span>
            <button
              type="button"
              onClick={() => set("commentsEnabled", !draft.commentsEnabled)}
              className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${draft.commentsEnabled ? "bg-indigo-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${draft.commentsEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          {draft.commentsEnabled && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Permitir fotos en comentarios</span>
              <button
                type="button"
                onClick={() => set("commentsAllowPhotos", !draft.commentsAllowPhotos)}
                className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${draft.commentsAllowPhotos ? "bg-indigo-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${draft.commentsAllowPhotos ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          )}
        </div>

        {/* Save */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          {formError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {formError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !draft.title}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors"
          >
            {saving ? <LoadingSpinner size="sm" className="text-white" /> : null}
            {saving ? "Guardando..." : "Guardar pagina"}
          </button>
          {publicUrl && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-xs text-indigo-600 underline">
              Ver pagina publica →
            </a>
          )}
        </div>
      </aside>

      {/* Right: live preview */}
      <div className="overflow-x-hidden overflow-y-auto rounded-2xl bg-gray-100 p-4 md:p-6">
        <p className="text-xs text-center text-gray-400 mb-4 uppercase tracking-widest">Vista previa en vivo</p>
        <div className="mx-auto w-full max-w-lg overflow-hidden">
          <PagePreview draft={draft} />
        </div>
      </div>
    </div>
  );
}
