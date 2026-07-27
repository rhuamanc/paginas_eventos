import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { listInvitationsByOwner, upsertInvitationForOwner } from "@/lib/storage";
import { invitationSchema } from "@/lib/validation";

export async function GET() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const invitations = await listInvitationsByOwner(session.user.id);
  return NextResponse.json({ invitations });
}

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = invitationSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const invitation = await upsertInvitationForOwner(session.user.id, parsed.data);
  return NextResponse.json({ invitation });
}
