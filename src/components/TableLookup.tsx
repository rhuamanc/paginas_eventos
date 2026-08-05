"use client";

import { useState } from "react";

type TableRow = { dni: string; name: string; tableNumber: string };

type Props = {
  rows: TableRow[];
  pdfUrl?: string;
  accentColor: string;
};

export default function TableLookup({ rows, pdfUrl, accentColor }: Props) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<TableRow | null | "not-found">(null);

  function search() {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const found = rows.find(r => r.dni.trim().toLowerCase() === q);
    setResult(found ?? "not-found");
  }

  const hasPdf = !!pdfUrl;
  const hasManual = rows.length > 0;

  if (!hasPdf && !hasManual) return null;

  return (
    <div className="space-y-4">
      {/* Buscador por DNI */}
      {hasManual && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setResult(null); }}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder="Ingresa tu DNI..."
              className="flex-1 rounded-xl border border-white/30 bg-white/20 px-4 py-2.5 text-sm placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-white/40"
              style={{ color: "inherit" }}
            />
            <button
              type="button"
              onClick={search}
              disabled={!query.trim()}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: accentColor, color: "#fff" }}
            >
              Buscar
            </button>
          </div>

          {result === "not-found" && (
            <div className="rounded-xl border border-red-300/40 bg-red-400/10 px-4 py-3 text-sm text-center">
              No se encontró ningún invitado con ese DNI.
            </div>
          )}

          {result && result !== "not-found" && (
            <div className="rounded-xl border border-white/30 bg-white/10 px-5 py-4 text-center space-y-1">
              <p className="text-xs uppercase tracking-widest opacity-60">Tu mesa es</p>
              <p className="text-5xl font-bold" style={{ color: accentColor }}>{result.tableNumber}</p>
              <p className="text-sm opacity-80">{result.name}</p>
            </div>
          )}
        </div>
      )}

      {/* Botón abrir PDF */}
      {hasPdf && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 opacity-70">
            <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z" />
            <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
          </svg>
          Ver PDF de asignación de mesas
        </a>
      )}
    </div>
  );
}
