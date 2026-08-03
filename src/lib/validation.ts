import { z } from "zod";

const sectionKeySchema = z.enum(["hero", "details", "countdown", "timeline", "parents", "godparents", "witnesses", "parish", "reception", "gallery", "message", "giftTable", "dressCode", "rsvp", "music"]);
const bulletStyleSchema = z.enum(["dot", "circle", "square", "dash"]);
const timelineItemSchema = z.object({
  time: z.string().min(1, "La hora del timeline es obligatoria.").max(40, "La hora del timeline no puede superar 40 caracteres."),
  title: z.string().min(1, "La actividad del timeline es obligatoria.").max(120, "La actividad del timeline no puede superar 120 caracteres."),
  description: z.string().max(240, "La descripcion del timeline no puede superar 240 caracteres.").optional(),
});

export const invitationSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  eventType: z.enum(["boda", "cumpleanos", "baby-shower", "graduacion", "otro"]),
  title: z.string().min(1, "El titulo es obligatorio.").max(120, "El titulo no puede superar 120 caracteres."),
  subtitle: z.string().max(200, "El subtitulo no puede superar 200 caracteres.").optional(),
  heroImage: z.string().max(5_000_000, "La URL de portada es demasiado larga.").optional(),
  hostNames: z.string().max(450, "Anfitriones no puede superar 450 caracteres.").optional(),
  dateTime: z.string().max(40, "La fecha y hora no puede superar 40 caracteres.").optional(),
  place: z.string().max(450, "Lugar no puede superar 450 caracteres.").optional(),
  address: z.string().max(200, "Direccion no puede superar 200 caracteres.").optional(),
  timeline: z.array(timelineItemSchema).max(20).default([]),
  parents: z.string().max(450, "Padres no puede superar 450 caracteres.").optional(),
  brideParents: z.string().max(450, "Padres de la novia no puede superar 450 caracteres.").optional(),
  groomParents: z.string().max(450, "Padres del novio no puede superar 450 caracteres.").optional(),
  parentsBulletStyle: bulletStyleSchema.default("dot"),
  godparents: z.string().max(450, "Padrinos no puede superar 450 caracteres.").optional(),
  godparentsBulletStyle: bulletStyleSchema.default("dot"),
  witnesses: z.string().max(450, "Testigos no puede superar 450 caracteres.").optional(),
  witnessesBulletStyle: bulletStyleSchema.default("dot"),
  parishName: z.string().max(450, "Nombre de la parroquia no puede superar 450 caracteres.").optional(),
  parishTime: z.string().max(40, "Hora de la parroquia no puede superar 40 caracteres.").optional(),
  parishMapUrl: z.string().max(1000, "El mapa de la parroquia es demasiado largo.").optional(),
  receptionName: z.string().max(450, "Nombre del salon no puede superar 450 caracteres.").optional(),
  receptionTime: z.string().max(40, "Hora del salon no puede superar 40 caracteres.").optional(),
  receptionMapUrl: z.string().max(1000, "El mapa del salon es demasiado largo.").optional(),
  message: z.string().max(1000, "El mensaje no puede superar 1000 caracteres.").optional(),
  giftTable: z.string().max(1500, "Mesa de regalos no puede superar 1500 caracteres.").optional(),
  dressCode: z.string().max(120, "Dress code no puede superar 120 caracteres.").optional(),
  musicUrl: z.string().max(500, "La URL de musica no puede superar 500 caracteres.").optional(),
  gallery: z.array(z.string().max(5_000_000)).max(20).default([]),
  theme: z.enum(["elegant", "romantic", "modern", "floral"]).default("elegant"),
  primaryColor: z.string().max(32, "Color principal invalido.").optional(),
  textColor: z.string().max(32, "Color de texto invalido.").optional(),
  sections: z.array(sectionKeySchema).default(["hero", "details", "countdown", "timeline", "parents", "godparents", "witnesses", "parish", "reception", "gallery", "message", "giftTable", "dressCode", "rsvp", "music"]),
  sectionOrder: z.array(sectionKeySchema).default(["hero", "details", "countdown", "timeline", "parents", "godparents", "witnesses", "parish", "reception", "gallery", "message", "giftTable", "dressCode", "rsvp", "music"]),
});

export const rsvpSchema = z.object({
  invitationId: z.string().min(3),
  name: z.string().min(2).max(80),
  attendees: z.number().int().min(1).max(20),
  message: z.string().max(400).optional().default(""),
});
