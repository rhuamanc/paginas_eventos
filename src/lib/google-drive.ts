type UploadInput = {
  accessToken: string;
  fileName: string;
  mimeType: string;
  data: Buffer;
};

function buildDriveImageUrl(fileId: string) {
  // Servir via proxy interno para evitar rate-limit (429) de Google CDN
  return `/api/drive/image?id=${fileId}`;
}

/**
 * Sube una imagen a Google Drive usando la API REST directamente (sin stream de Node).
 * Devuelve una URL publica directa.
 */
export async function uploadImageToGoogleDrive(input: UploadInput): Promise<string> {
  const boundary = "----InvitaStudioBoundary";

  const metadata = JSON.stringify({ name: input.fileName, mimeType: input.mimeType });

  const bodyParts = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
    `--${boundary}\r\nContent-Type: ${input.mimeType}\r\n\r\n`,
  ];

  const encoder = new TextEncoder();
  const part1 = encoder.encode(bodyParts[0]);
  const part2 = encoder.encode(bodyParts[1]);
  const closing = encoder.encode(`\r\n--${boundary}--`);

  const body = new Uint8Array(part1.length + part2.length + input.data.length + closing.length);
  body.set(part1, 0);
  body.set(part2, part1.length);
  body.set(input.data, part1.length + part2.length);
  body.set(closing, part1.length + part2.length + input.data.length);

  // 1. Crear archivo
  const createRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`Drive create failed (${createRes.status}): ${text}`);
  }

  const { id: fileId } = (await createRes.json()) as { id: string };
  if (!fileId) throw new Error("Drive no devolvio fileId");

  // 2. Hacer el archivo publico
  const permRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    }
  );

  if (!permRes.ok) {
    const text = await permRes.text();
    throw new Error(`Drive permissions failed (${permRes.status}): ${text}`);
  }

  // URL estable para renderizar la imagen en etiquetas img.
  return buildDriveImageUrl(fileId);
}
