import { NextResponse } from "next/server";

// Cache en memoria simple para evitar re-fetches en la misma instancia del servidor
const cache = new Map<string, { data: ArrayBuffer; contentType: string; at: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hora

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("id");

  if (!fileId || !/^[a-zA-Z0-9_-]{10,}$/.test(fileId)) {
    return NextResponse.json({ error: "id invalido" }, { status: 400 });
  }

  const now = Date.now();
  const cached = cache.get(fileId);
  if (cached && now - cached.at < CACHE_TTL_MS) {
    return new NextResponse(cached.data, {
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Cache": "HIT",
      },
    });
  }

  // Intentar con la URL directa de Drive
  const url = `https://drive.google.com/uc?export=view&id=${fileId}`;
  let res: Response;

  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; InvitaStudio/1.0)",
      },
      redirect: "follow",
    });
  } catch {
    return NextResponse.json({ error: "No se pudo contactar a Google Drive" }, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: `Google Drive respondio ${res.status}` },
      { status: res.status >= 500 ? 502 : res.status }
    );
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";

  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "El recurso no es una imagen" }, { status: 400 });
  }

  const arrayBuffer = await res.arrayBuffer();

  // Guardar en cache solo si es razonable (< 20 MB)
  if (arrayBuffer.byteLength < 20 * 1024 * 1024) {
    cache.set(fileId, { data: arrayBuffer, contentType, at: now });
  }

  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Cache": "MISS",
    },
  });
}
