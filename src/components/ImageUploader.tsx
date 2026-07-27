"use client";

import { useRef, useState } from "react";

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

  const isMulti = props.multiple === true;

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
        const urls: string[] = [];

        for (const file of Array.from(files)) {
          const url = await uploadFile(file);
          urls.push(url);
        }

        multi.onChange([...multi.value, ...urls]);
      } else {
        const single = props as Props;
        const url = await uploadFile(files[0]);
        single.onChange(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
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

    return (
      <div className="space-y-2">
        {label && <p className="text-xs text-gray-500">{label}</p>}

        <label
          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors cursor-pointer
            ${dragOver ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/40"}
            ${uploading ? "opacity-60 pointer-events-none" : ""}`}
          style={{ minHeight: value ? 100 : 80 }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Portada" className="w-full max-h-48 rounded-xl object-cover" />
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-xs font-semibold text-white">Cambiar imagen</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 py-4 px-3 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-gray-300">
                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
              </svg>
              {uploading ? (
                <p className="text-xs text-indigo-500 font-medium">Subiendo...</p>
              ) : (
                <>
                  <p className="text-xs font-semibold text-gray-600">Haz clic o arrastra una imagen aquí</p>
                  <p className="text-xs text-gray-400">JPG, PNG, WEBP · máx 10 MB</p>
                </>
              )}
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => void handleFiles(e.target.files)}
          />
        </label>

        {value && (
          <button
            type="button"
            onClick={() => (props as Props).onChange("")}
            className="text-xs text-red-400 hover:text-red-600"
          >
            ✕ Quitar imagen
          </button>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  // ---------- render multiple ----------
  const { value: urls, label } = props as MultiProps;

  return (
    <div className="space-y-2">
      {label && <p className="text-xs text-gray-500">{label}</p>}

      <label
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 px-3 text-center transition-colors cursor-pointer
          ${dragOver ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/40"}
          ${uploading ? "opacity-60 pointer-events-none" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-gray-300">
          <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
        </svg>
        {uploading ? (
          <p className="text-xs text-indigo-500 font-medium">Subiendo imágenes...</p>
        ) : (
          <>
            <p className="text-xs font-semibold text-gray-600">Haz clic o arrastra imágenes aquí</p>
            <p className="text-xs text-gray-400">Puedes seleccionar varias a la vez · máx 10 MB c/u</p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Grid de imágenes subidas */}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {urls.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
