import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getAuthSession();

  if (!session?.user?.id || !session.accessToken) {
    return NextResponse.json(
      { error: "Debes iniciar sesion para subir archivos." },
      { status: 401 }
    );
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo invalido" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Solo se permiten archivos PDF" }, { status: 400 });
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "Maximo 20MB por PDF" }, { status: 400 });
  }

  const boundary = "----InvitaStudioPdfBoundary";
  const metadata = JSON.stringify({ name: file.name, mimeType: "application/pdf" });

  const encoder = new TextEncoder();
  const part1 = encoder.encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`);
  const part2 = encoder.encode(`--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`);
  const closing = encoder.encode(`\r\n--${boundary}--`);

  const arrayBuffer = await file.arrayBuffer();
  const fileData = new Uint8Array(arrayBuffer);

  const body = new Uint8Array(part1.length + part2.length + fileData.length + closing.length);
  body.set(part1, 0);
  body.set(part2, part1.length);
  body.set(fileData, part1.length + part2.length);
  body.set(closing, part1.length + part2.length + fileData.length);

  const createRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!createRes.ok) {
    const text = await createRes.text();
    console.error("[drive/pdf] create failed:", text);
    return NextResponse.json({ error: "No se pudo subir el PDF a Google Drive." }, { status: 500 });
  }

  const { id: fileId } = (await createRes.json()) as { id: string };
  if (!fileId) {
    return NextResponse.json({ error: "Drive no devolvio fileId" }, { status: 500 });
  }

  // Hacer el archivo público
  const permRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    }
  );

  if (!permRes.ok) {
    const text = await permRes.text();
    console.error("[drive/pdf] permissions failed:", text);
    return NextResponse.json({ error: "No se pudo hacer el PDF publico." }, { status: 500 });
  }

  // URL de visualizador de Drive (abre en nueva pestaña sin descarga forzada)
  const pdfUrl = `https://drive.google.com/file/d/${fileId}/view`;

  return NextResponse.json({ pdfUrl });
}
