import { nanoid } from "nanoid";
import { toSlug } from "./slug";
import { connectDb } from "./db";
import { CommentModel, InvitationModel, RsvpModel } from "./models";
import type { Invitation, InvitationComment, RSVP } from "@/types/invitation";

function toPlain<T>(doc: T & { toObject?: () => unknown }): T {
  return (typeof doc?.toObject === "function" ? doc.toObject() : doc) as T;
}

export async function listInvitations(): Promise<Invitation[]> {
  await connectDb();
  const docs = await InvitationModel.find({}).sort({ updatedAt: -1 }).lean();
  return docs as unknown as Invitation[];
}

export async function listInvitationsByOwner(ownerId: string): Promise<Invitation[]> {
  await connectDb();
  const docs = await InvitationModel.find({ ownerId }).sort({ updatedAt: -1 }).lean();
  return docs as unknown as Invitation[];
}

export async function getInvitationById(id: string): Promise<Invitation | null> {
  await connectDb();
  const doc = await InvitationModel.findOne({ id }).lean();
  return doc ? (JSON.parse(JSON.stringify(doc)) as Invitation) : null;
}

export async function getInvitationByIdForOwner(id: string, ownerId: string): Promise<Invitation | null> {
  await connectDb();
  const doc = await InvitationModel.findOne({ id, ownerId }).lean();
  return doc ? (JSON.parse(JSON.stringify(doc)) as Invitation) : null;
}

export async function getInvitationBySlug(slug: string): Promise<Invitation | null> {
  await connectDb();
  const doc = await InvitationModel.findOne({ slug }).lean();
  return doc ? (JSON.parse(JSON.stringify(doc)) as Invitation) : null;
}

export async function upsertInvitation(input: Partial<Invitation> & { title: string }): Promise<Invitation> {
  await connectDb();

  const now = new Date().toISOString();
  const id = input.id ?? nanoid(10);
  const existing = await InvitationModel.findOne({ id }).lean() as unknown as Invitation | null;

  // Conservar slug existente; solo generar uno nuevo en la primera creacion
  const slug = existing?.slug
    ?? `${toSlug(input.title || "invitacion") || "invitacion"}-${id.slice(0, 4)}`;

  const data: Invitation = {
    id,
    ownerId: input.ownerId ?? (existing as unknown as Invitation)?.ownerId ?? "",
    slug,
    eventType: input.eventType ?? "otro",
    title: input.title,
    subtitle: input.subtitle ?? "",
    heroImage: input.heroImage ?? "",
    hostNames: input.hostNames ?? "",
    dateTime: input.dateTime ?? "",
    place: input.place ?? "",
    address: input.address ?? "",
    timeline: input.timeline ?? [],
    parents: input.parents ?? "",
    parentsBulletStyle: input.parentsBulletStyle ?? "dot",
    godparents: input.godparents ?? "",
    godparentsBulletStyle: input.godparentsBulletStyle ?? "dot",
    witnesses: input.witnesses ?? "",
    witnessesBulletStyle: input.witnessesBulletStyle ?? "dot",
    parishName: input.parishName ?? "",
    parishTime: input.parishTime ?? "",
    parishMapUrl: input.parishMapUrl ?? "",
    receptionName: input.receptionName ?? "",
    receptionTime: input.receptionTime ?? "",
    receptionMapUrl: input.receptionMapUrl ?? "",
    message: input.message ?? "",
    dressCode: input.dressCode ?? "",
    musicUrl: input.musicUrl ?? "",
    gallery: input.gallery ?? [],
    theme: input.theme ?? "elegant",
    primaryColor: input.primaryColor ?? "",
    textColor: input.textColor ?? "",
    sections: input.sections ?? ["hero", "details", "countdown", "timeline", "parents", "godparents", "witnesses", "parish", "reception", "gallery", "message", "dressCode", "rsvp", "music"],
    sectionOrder: input.sectionOrder ?? existing?.sectionOrder ?? ["hero", "details", "countdown", "timeline", "parents", "godparents", "witnesses", "parish", "reception", "gallery", "message", "dressCode", "rsvp", "music"],
    createdAt: (existing as unknown as Invitation)?.createdAt ?? now,
    updatedAt: now,
  };

  const doc = await InvitationModel.findOneAndUpdate(
    { id },
    { $set: data },
    { upsert: true, new: true, lean: true }
  );

  return toPlain(doc as unknown as Invitation & { toObject?: () => unknown });
}

export async function upsertInvitationForOwner(
  ownerId: string,
  input: Partial<Invitation> & { title: string }
): Promise<Invitation> {
  await connectDb();

  const now = new Date().toISOString();
  const id = input.id ?? nanoid(10);
  const existing = await InvitationModel.findOne({ id, ownerId }).lean() as unknown as Invitation | null;

  // Conservar slug existente; solo generar uno nuevo en la primera creacion
  const slug = existing?.slug
    ?? `${toSlug(input.title || "invitacion") || "invitacion"}-${id.slice(0, 4)}`;

  const data: Invitation = {
    id,
    ownerId,
    slug,
    eventType: input.eventType ?? "otro",
    title: input.title,
    subtitle: input.subtitle ?? "",
    heroImage: input.heroImage ?? "",
    hostNames: input.hostNames ?? "",
    dateTime: input.dateTime ?? "",
    place: input.place ?? "",
    address: input.address ?? "",
    timeline: input.timeline ?? [],
    parents: input.parents ?? "",
    parentsBulletStyle: input.parentsBulletStyle ?? "dot",
    godparents: input.godparents ?? "",
    godparentsBulletStyle: input.godparentsBulletStyle ?? "dot",
    witnesses: input.witnesses ?? "",
    witnessesBulletStyle: input.witnessesBulletStyle ?? "dot",
    parishName: input.parishName ?? "",
    parishTime: input.parishTime ?? "",
    parishMapUrl: input.parishMapUrl ?? "",
    receptionName: input.receptionName ?? "",
    receptionTime: input.receptionTime ?? "",
    receptionMapUrl: input.receptionMapUrl ?? "",
    message: input.message ?? "",
    dressCode: input.dressCode ?? "",
    musicUrl: input.musicUrl ?? "",
    gallery: input.gallery ?? [],
    theme: input.theme ?? "elegant",
    primaryColor: input.primaryColor ?? "",
    textColor: input.textColor ?? "",
    sections: input.sections ?? ["hero", "details", "countdown", "timeline", "parents", "godparents", "witnesses", "parish", "reception", "gallery", "message", "dressCode", "rsvp", "music"],
    sectionOrder: input.sectionOrder ?? existing?.sectionOrder ?? ["hero", "details", "countdown", "timeline", "parents", "godparents", "witnesses", "parish", "reception", "gallery", "message", "dressCode", "rsvp", "music"],
    createdAt: (existing as unknown as Invitation)?.createdAt ?? now,
    updatedAt: now,
  };

  const doc = await InvitationModel.findOneAndUpdate(
    { id, ownerId },
    { $set: data },
    { upsert: true, new: true, lean: true }
  );

  return toPlain(doc as unknown as Invitation & { toObject?: () => unknown });
}

export async function deleteInvitation(id: string): Promise<boolean> {
  await connectDb();
  const result = await InvitationModel.deleteOne({ id });

  if (result.deletedCount === 0) {
    return false;
  }

  await RsvpModel.deleteMany({ invitationId: id });
  return true;
}

export async function deleteInvitationForOwner(id: string, ownerId: string): Promise<boolean> {
  await connectDb();
  const result = await InvitationModel.deleteOne({ id, ownerId });

  if (result.deletedCount === 0) {
    return false;
  }

  await RsvpModel.deleteMany({ invitationId: id });
  return true;
}

export async function addRsvp(input: Omit<RSVP, "id" | "createdAt">): Promise<RSVP> {
  await connectDb();

  const doc = await RsvpModel.create({
    id: nanoid(10),
    invitationId: input.invitationId,
    name: input.name,
    attendees: input.attendees,
    message: input.message,
    createdAt: new Date().toISOString(),
  });

  return toPlain(doc as unknown as RSVP & { toObject?: () => unknown });
}

export async function listRsvps(invitationId: string): Promise<RSVP[]> {
  await connectDb();
  const docs = await RsvpModel.find({ invitationId }).sort({ createdAt: -1 }).lean();
  return docs as unknown as RSVP[];
}

export async function addComment(
  input: Omit<InvitationComment, "id" | "createdAt">
): Promise<InvitationComment> {
  await connectDb();

  const doc = await CommentModel.create({
    id: nanoid(10),
    invitationId: input.invitationId,
    userId: input.userId,
    userName: input.userName,
    avatarUrl: input.avatarUrl,
    text: input.text,
    imageUrl: input.imageUrl,
    createdAt: new Date().toISOString(),
  });

  return toPlain(doc as unknown as InvitationComment & { toObject?: () => unknown });
}

export async function listComments(invitationId: string): Promise<InvitationComment[]> {
  await connectDb();
  const docs = await CommentModel.find({ invitationId }).sort({ createdAt: -1 }).lean();
  return docs as unknown as InvitationComment[];
}
