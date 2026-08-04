"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import type { InvitationComment } from "@/types/invitation";

type Props = {
  invitationId: string;
  allowPhotos?: boolean;
};

function normalizeDriveImageUrl(url: string) {
  const trimmed = url.trim();

  // URLs tipo /api/drive/image?id=... ya son del proxy, devolver tal cual
  if (trimmed.startsWith("/api/drive/image")) return trimmed;

  // Extraer fileId de URLs de Drive y redirigir al proxy interno
  const directMatch = trimmed.match(/[?&]id=([^&]+)/);
  if (directMatch?.[1]) {
    return `/api/drive/image?id=${directMatch[1]}`;
  }

  const fileMatch = trimmed.match(/\/file\/d\/([^/]+)/);
  if (fileMatch?.[1]) {
    return `/api/drive/image?id=${fileMatch[1]}`;
  }

  // lh3.googleusercontent.com/d/FILE_ID=wXXX
  const lhMatch = trimmed.match(/lh3\.googleusercontent\.com\/d\/([^=?&/]+)/);
  if (lhMatch?.[1]) {
    return `/api/drive/image?id=${lhMatch[1]}`;
  }

  return trimmed;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function CommentsSection({ invitationId, allowPhotos = true }: Props) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<InvitationComment[]>([]);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  const userAvatar = session?.user?.image || "";
  const userName = session?.user?.name || "Usuario";
  const isLoggedIn = !!session?.user?.id;

  async function loadComments() {
    const response = await fetch(`/api/comments?invitationId=${invitationId}`);
    const data = await response.json();
    setComments(data.comments || []);
  }

  useEffect(() => {
    void loadComments();
  }, [invitationId]);

  useEffect(() => {
    if (!isLoggedIn) {
      setText("");
      setImageUrl("");
      setStatus("");
    }
  }, [isLoggedIn]);

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setStatus("Solo puedes subir imagenes.");
      return;
    }

    if (!isLoggedIn) {
      setStatus("Debes iniciar sesion para publicar fotos.");
      return;
    }

    setStatus("");

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch("/api/drive/upload", {
        method: "POST",
        body: form,
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("[Drive upload error]", data);
        setStatus((data.error || data.detail) ?? "No se pudo subir a Drive.");
        return;
      }

      setImageUrl(data.imageUrl ? normalizeDriveImageUrl(data.imageUrl) : "");
    } catch {
      setStatus("Error subiendo imagen.");
    } finally {
      setUploading(false);
    }
  }

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLoggedIn) {
      setStatus("Debes iniciar sesion para comentar.");
      return;
    }

    if (!text.trim()) {
      setStatus("El comentario no puede estar vacio.");
      return;
    }

    setSending(true);
    setStatus("");

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          text: text.trim(),
          imageUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error || "No se pudo publicar comentario.");
        return;
      }

      setComments((prev) => [data.comment, ...prev]);
      setText("");
      setImageUrl("");
      setStatus("Comentario publicado.");
    } catch {
      setStatus("Error de red al publicar comentario.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[color:var(--line)] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-serif text-2xl">Comentarios</h3>
        {!isLoggedIn ? (
          <button
            type="button"
            onClick={() => signIn("google")}
            className="rounded-full border border-[color:var(--line)] px-3 py-1 text-xs font-semibold"
          >
            Entrar con Google para comentar
          </button>
        ) : null}
      </div>

      {isLoggedIn ? (
        <form onSubmit={submitComment}>
          {/* Fila principal: avatar + caja de texto */}
          <div className="flex items-start gap-3">
            {/* Avatar */}
            {userAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userAvatar} alt={userName} referrerPolicy="no-referrer" className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--brand)] text-sm font-semibold text-white">
                {userName.slice(0, 1).toUpperCase()}
              </div>
            )}

            {/* Burbuja de comentario */}
            <div className="flex-1 rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)]/60 focus-within:border-[color:var(--brand)] transition-colors">
              {/* Preview de imagen seleccionada */}
              {imageUrl ? (
                <div className="relative px-3 pt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Preview" className="max-h-48 w-full rounded-xl object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    aria-label="Quitar imagen"
                  >
                    ✕
                  </button>
                </div>
              ) : null}

              {/* Textarea */}
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={`Comenta como ${userName}…`}
                rows={1}
                className="w-full resize-none rounded-2xl bg-transparent px-4 py-2.5 text-sm focus:outline-none"
                style={{ minHeight: "42px" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }}
              />

              {/* Barra inferior: ícono foto + estado + enviar */}
              <div className="flex items-center justify-between px-2 pb-2">
                {/* Botón subir foto */}
                {allowPhotos ? (
                <label
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    uploading
                      ? "opacity-50 cursor-not-allowed text-[color:var(--ink-soft)]"
                      : "text-[color:var(--brand)] hover:bg-[color:var(--brand)]/10"
                  }`}
                  title="Agregar foto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                  </svg>
                  {uploading ? "Subiendo…" : "Foto"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadImage(file);
                      event.target.value = "";
                    }}
                  />
                </label>
                ) : <span />}

                <div className="flex items-center gap-2">
                  {/* Cerrar sesion */}
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: window.location.pathname })}
                    className="rounded-full px-2 py-1 text-xs text-[color:var(--ink-soft)] hover:bg-[color:var(--line)]"
                  >
                    Cerrar sesión
                  </button>

                  {/* Enviar */}
                  <button
                    type="submit"
                    disabled={sending || uploading || (!text.trim() && !imageUrl)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--brand)] text-white transition-opacity disabled:opacity-40"
                    aria-label="Publicar comentario"
                  >
                    {sending ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje de error/estado */}
          {status ? (
            <p className={`mt-2 pl-13 text-xs ${status.startsWith("Comentario") ? "text-green-600" : "text-red-500"}`}>
              {status}
            </p>
          ) : null}
        </form>
      ) : (
        <button
          type="button"
          onClick={() => signIn("google")}
          className="flex w-full items-center gap-3 rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)]/50 px-4 py-3 text-sm text-[color:var(--ink-soft)] hover:bg-[color:var(--paper)] transition-colors"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-dashed border-[color:var(--line)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 opacity-40">
              <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
            </svg>
          </div>
          <span>Entra con Google para comentar y subir fotos…</span>
          <span className="ml-auto text-xs font-semibold text-[color:var(--brand)]">Entrar →</span>
        </button>
      )}

      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-[color:var(--ink-soft)]">Aun no hay comentarios.</p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-xl border border-[color:var(--line)] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {comment.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={comment.avatarUrl} alt={comment.userName} referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--brand)] text-xs font-semibold text-white">
                      {comment.userName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <p className="font-semibold">{comment.userName}</p>
                </div>
                <p className="text-xs text-[color:var(--ink-soft)]">{formatDate(comment.createdAt)}</p>
              </div>
              <p className="text-sm leading-relaxed">{comment.text}</p>
              {comment.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={normalizeDriveImageUrl(comment.imageUrl)} alt="Foto del comentario" className="mt-3 max-h-64 w-full rounded-lg object-cover" />
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
