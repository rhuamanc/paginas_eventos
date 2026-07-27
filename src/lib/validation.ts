import { z } from "zod";

const sectionKeySchema = z.enum(["hero", "details", "countdown", "gallery", "message", "dressCode", "map", "rsvp", "music"]);

export const invitationSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  eventType: z.enum(["boda", "cumpleanos", "baby-shower", "graduacion", "otro"]),
  title: z.string().min(1).max(120),
  subtitle: z.string().max(200).optional(),
  heroImage: z.string().max(5_000_000).optional(),
  hostNames: z.string().max(120).optional(),
  dateTime: z.string().max(40).optional(),
  place: z.string().max(160).optional(),
  address: z.string().max(200).optional(),
  mapUrl: z.string().max(1000).optional(),
  message: z.string().max(1000).optional(),
  dressCode: z.string().max(120).optional(),
  musicUrl: z.string().max(500).optional(),
  gallery: z.array(z.string().max(5_000_000)).max(20).default([]),
  theme: z.enum(["elegant", "romantic", "modern", "floral"]).default("elegant"),
  primaryColor: z.string().max(32).optional(),
  textColor: z.string().max(32).optional(),
  sections: z.array(sectionKeySchema).default(["hero", "details", "countdown", "gallery", "message", "dressCode", "map", "rsvp", "music"]),
});

export const rsvpSchema = z.object({
  invitationId: z.string().min(3),
  name: z.string().min(2).max(80),
  attendees: z.number().int().min(1).max(20),
  message: z.string().max(400).optional().default(""),
});
