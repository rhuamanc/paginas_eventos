import { NextResponse } from "next/server";
import { addComment, listComments } from "@/lib/storage";
import { getAuthSession } from "@/lib/auth";
import { z } from "zod";

const commentSchema = z.object({
  invitationId: z.string().min(3),
  userName: z.string().min(2).max(80).optional(),
  text: z.string().min(1).max(600),
  imageUrl: z.string().max(2_000).optional().or(z.literal("")),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invitationId = searchParams.get("invitationId") || "";

  if (!invitationId) {
    return NextResponse.json({ error: "invitationId es requerido" }, { status: 400 });
  }

  const comments = await listComments(invitationId);
  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = commentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const session = await getAuthSession();

  if (session?.user?.provider !== "google") {
    return NextResponse.json(
      { error: "Debes iniciar sesion con Google para comentar." },
      { status: 403 }
    );
  }

  const comment = await addComment({
    invitationId: parsed.data.invitationId,
    userId: session?.user?.id,
    userName: session.user.name ?? "Usuario de Google",
    avatarUrl: session.user.image || undefined,
    text: parsed.data.text,
    imageUrl: parsed.data.imageUrl || undefined,
  });

  return NextResponse.json({ comment });
}
