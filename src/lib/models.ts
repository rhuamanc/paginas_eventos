import mongoose, { Schema, model, models } from "mongoose";
import type { AppUser, Invitation, InvitationComment, RSVP } from "@/types/invitation";

const SECTION_KEYS = ["hero", "details", "countdown", "timeline", "gallery", "message", "dressCode", "map", "rsvp", "music"];

const InvitationSchema = new Schema<Invitation>(
  {
    id: { type: String, required: true, unique: true },
    ownerId: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    eventType: { type: String, enum: ["boda", "cumpleanos", "baby-shower", "graduacion", "otro"] },
    title: String,
    subtitle: String,
    heroImage: String,
    hostNames: String,
    dateTime: String,
    place: String,
    address: String,
    mapUrl: String,
    timeline: [{ time: String, title: String, description: String }],
    message: String,
    dressCode: String,
    musicUrl: String,
    gallery: [String],
    theme: { type: String, enum: ["elegant", "romantic", "modern", "floral"], default: "elegant" },
    primaryColor: String,
    textColor: String,
    sections: [{ type: String, enum: SECTION_KEYS }],
    sectionOrder: [{ type: String, enum: SECTION_KEYS }],
    createdAt: String,
    updatedAt: String,
  },
  { versionKey: false }
);

const UserSchema = new Schema<AppUser>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    googleId: { type: String, required: true, index: true },
    createdAt: { type: String, required: true },
  },
  { versionKey: false }
);

const RsvpSchema = new Schema<RSVP>(
  {
    id: { type: String, required: true, unique: true },
    invitationId: { type: String, required: true, index: true },
    name: String,
    attendees: Number,
    message: String,
    createdAt: String,
  },
  { versionKey: false }
);

const CommentSchema = new Schema<InvitationComment>(
  {
    id: { type: String, required: true, unique: true },
    invitationId: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    userName: { type: String, required: true },
    avatarUrl: String,
    text: { type: String, required: true },
    imageUrl: String,
    createdAt: { type: String, required: true },
  },
  { versionKey: false }
);

export const InvitationModel =
  (() => {
    const existing = models.Invitation as mongoose.Model<Invitation> | undefined;
    if (existing) {
      // En dev, Next puede reutilizar modelos cacheados; agrega el campo si falta.
      if (!existing.schema.path("textColor")) {
        existing.schema.add({ textColor: String });
      }
      if (!existing.schema.path("sectionOrder")) {
        existing.schema.add({ sectionOrder: [{ type: String, enum: SECTION_KEYS }] });
      }
      return existing;
    }

    return model<Invitation>("Invitation", InvitationSchema);
  })();

export const RsvpModel =
  (models.Rsvp as mongoose.Model<RSVP>) ??
  model<RSVP>("Rsvp", RsvpSchema);

export const UserModel =
  (models.User as mongoose.Model<AppUser>) ??
  model<AppUser>("User", UserSchema);

export const CommentModel =
  (models.Comment as mongoose.Model<InvitationComment>) ??
  model<InvitationComment>("Comment", CommentSchema);
