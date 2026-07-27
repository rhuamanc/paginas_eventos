import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { deleteInvitationForOwner, getInvitationByIdForOwner, listRsvps } from "@/lib/storage";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const invitation = await getInvitationByIdForOwner(id, session.user.id);

  if (!invitation) {
    return NextResponse.json({ error: "Invitacion no encontrada" }, { status: 404 });
  }

  const rsvps = await listRsvps(id);
  return NextResponse.json({ invitation, rsvps });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deleteInvitationForOwner(id, session.user.id);

  if (!ok) {
    return NextResponse.json({ error: "Invitacion no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
