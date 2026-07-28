"use client";

import { useEffect, useRef, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  multiple?: false;
};

type MultiProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  multiple: true;
};

export default function ImageUploader(props: Props | MultiProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState("");
  const [localGalleryPreviews, setLocalGalleryPreviews] = useState<string[]>([]);

  const isMulti = props.multiple === true;

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }

      localGalleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [localGalleryPreviews, localPreview]);

  async function uploadFile(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/drive/upload", { method: "POST", body: form });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error ?? "Error al subir imagen");

    return data.imageUrl as string;
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setError("");
    setUploading(true);

    try {
      if (isMulti) {
        const multi = props as MultiProps;
        const tempPreviews = Array.from(files).map((file) => URL.createObjectURL(file));
        setLocalGalleryPreviews(tempPreviews);
        const urls: string[] = [];

        for (const file of Array.from(files)) {
          const url = await uploadFile(file);
          urls.push(url);
        }

        multi.onChange([...multi.value, ...urls]);
        setLocalGalleryPreviews((current) => {
          current.forEach((url) => URL.revokeObjectURL(url));
          return [];
        });
      } else {
        const single = props as Props;
        const tempPreview = URL.createObjectURL(files[0]);
        setLocalPreview((current) => {
          if (current) {
            URL.revokeObjectURL(current);
          }
          return tempPreview;
        });
        const url = await uploadFile(files[0]);
        single.onChange(url);
        setLocalPreview((current) => {
          if (current) {
            URL.revokeObjectURL(current);
          }
          return "";
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
        setLocalPreview("");
      }
      setLocalGalleryPreviews((current) => {
        current.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    void handleFiles(e.dataTransfer.files);
  }

  // ---------- render single ----------
  if (!isMulti) {
    const { value, label } = props as Props;
    const previewSrc = localPreview || value;

    return (
      <div className="space-y-2">
        {label && <p className="text-xs text-gray-500">{label}</p>}

        <div
          className={`space-y-3 rounded-xl border border-gray-200 bg-white p-3 transition-colors ${
            dragOver ? "border-indigo-400 bg-indigo-50/40" : ""
          } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {previewSrc ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewSrc} alt="Portada" className="w-full max-h-48 rounded-xl object-cover" />
              {uploading ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/35">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700">
                    <LoadingSpinner size="sm" className="text-[color:var(--brand)]" />
                    Procesando vista previa...
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-5 text-center">
              <p className="text-xs text-gray-400">JPG, PNG, WEBP · max 10 MB</p>
              <p className="mt-1 text-xs text-gray-400">Tambien puedes arrastrar una imagen aqui</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              {uploading ? <LoadingSpinner size="sm" className="text-white" /> : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                </svg>
              )}
              {uploading ? "Subiendo..." : value ? "Cambiar foto" : "Subir foto"}
            </button>

            {previewSrc ? (
              <button
                type="button"
                onClick={() => (props as Props).onChange("")}
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
              >
                Quitar foto
              </button>
            ) : null}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => void handleFiles(e.target.files)}
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // ---------- render multiple ----------
  const { value: urls, label } = props as MultiProps;
  const galleryUrls = [...urls, ...localGalleryPreviews];

  return (
    <div className="space-y-2">
      {label && <p className="text-xs text-gray-500">{label}</p>}

      <div
        className={`space-y-3 rounded-xl border border-gray-200 bg-white p-3 transition-colors ${
          dragOver ? "border-indigo-400 bg-indigo-50/40" : ""
        } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-5 text-center">
          <p className="text-xs text-gray-400">Puedes seleccionar varias imagenes a la vez</p>
          <p className="mt-1 text-xs text-gray-400">Tambien puedes arrastrarlas aqui · max 10 MB c/u</p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
        >
          {uploading ? <LoadingSpinner size="sm" className="text-white" /> : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
            </svg>
          )}
          {uploading ? "Subiendo imagenes..." : "Agregar fotos"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Grid de imágenes subidas */}
      {galleryUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {galleryUrls.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
              {i < urls.length ? (
                <button
                  type="button"
                  onClick={() => {
                    const next = [...urls];
                    next.splice(i, 1);
                    (props as MultiProps).onChange(next);
                  }}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              ) : null}
              {i >= urls.length ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700">
                    <LoadingSpinner size="sm" className="text-[color:var(--brand)]" />
                    Subiendo...
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
