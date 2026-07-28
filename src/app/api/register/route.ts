import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.json(
    { error: "El registro solo está disponible a través de Google OAuth. Por favor, usa el botón 'Registrarse con Google'." },
    { status: 403 }
  );
}
