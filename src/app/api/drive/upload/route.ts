import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { uploadImageToGoogleDrive } from "@/lib/google-drive";

function getDriveUserMessage(detail: string) {
  if (detail.includes("SERVICE_DISABLED") || detail.includes("accessNotConfigured")) {
    return "La API de Google Drive no esta habilitada en tu proyecto de Google Cloud. Actívala en Google Cloud Console, espera unos minutos y vuelve a intentarlo.";
  }

  if (detail.includes("insufficient authentication scopes")) {
    return "Tu sesion de Google no tiene permisos de Drive. Cierra sesion, entra otra vez con Google y acepta los permisos solicitados.";
  }

  if (detail.includes("Invalid Credentials") || detail.includes("invalid_grant") || detail.includes("401")) {
    return "Tu sesion de Google expiro. Cierra sesion y vuelve a entrar para renovar el acceso.";
  }

  return "No se pudo subir la imagen a Google Drive.";
}

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id || session.user.provider !== "google" || !session.accessToken) {
    return NextResponse.json(
      { error: "Debes iniciar sesion con Google para subir a Drive." },
      { status: 401 }
    );
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo invalido" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Solo se permiten imagenes" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Maximo 10MB por imagen" }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const imageUrl = await uploadImageToGoogleDrive({
      accessToken: session.accessToken,
      fileName: file.name,
      mimeType: file.type || "image/jpeg",
      data: buffer,
    });

    return NextResponse.json({ imageUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[drive/upload] error:", msg);
    return NextResponse.json(
      { error: getDriveUserMessage(msg), detail: msg },
      { status: 500 }
    );
  }
}
