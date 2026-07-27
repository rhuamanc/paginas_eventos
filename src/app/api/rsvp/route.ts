import { NextResponse } from "next/server";
import { addRsvp } from "@/lib/storage";
import { rsvpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = rsvpSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de RSVP invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const rsvp = await addRsvp(parsed.data);
  return NextResponse.json({ rsvp });
}
