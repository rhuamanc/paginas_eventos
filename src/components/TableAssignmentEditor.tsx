"use client";

import { useState, useRef } from "react";
import LoadingSpinner from "./LoadingSpinner";

type TableRow = { dni: string; name: string; tableNumber: string };

type Props = {
  rows: TableRow[];
  pdfUrl: string;
  onChangeRows: (rows: TableRow[]) => void;
  onChangePdf: (url: string) => void;
};

const EMPTY_ROW: TableRow = { dni: "", name: "", tableNumber: "" };

export default function TableAssignmentEditor({ rows, pdfUrl, onChangeRows, onChangePdf }: Props) {
  const [mode, setMode] = useState<"manual" | "pdf">(pdfUrl ? "pdf" : "manual");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkError, setBulkError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function addRow() {
    onChangeRows([...rows, { ...EMPTY_ROW }]);
  }

  function removeRow(idx: number) {
    onChangeRows(rows.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, key: keyof TableRow, value: string) {
    onChangeRows(rows.map((r, i) => i === idx ? { ...r, [key]: value } : r));
  }

  async function uploadPdf(file: File) {
    setUploadError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/drive/pdf", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "No se pudo subir el PDF.");
        return;
      }
      onChangePdf(data.pdfUrl);
    } catch {
      setUploadError("Error de red al subir el PDF.");
    } finally {
      setUploading(false);
    }
  }

  function parseBulk() {
    setBulkError("");
    const lines = bulkText.trim().split(/\r?\n/).filter(Boolean);
    const parsed: TableRow[] = [];
    for (const line of lines) {
      // Separadores: coma, punto y coma o tabulación
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      if (parts.length < 3) {
        setBulkError(`Línea inválida: "${line}". Formato: DNI, Nombre, Mesa`);
        return;
      }
      parsed.push({ dni: parts[0], name: parts.slice(1, parts.length - 1).join(" "), tableNumber: parts[parts.length - 1] });
    }
    onChangeRows([...rows, ...parsed]);
    setBulkText("");
  }

  const inputCls = "w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <div className="space-y-4">
      {/* Selector de modo */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors ${mode === "manual" ? "bg-indigo-500 text-white border-indigo-500" : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"}`}
        >
          Ingresar manualmente
        </button>
        <button
          type="button"
          onClick={() => setMode("pdf")}
          className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors ${mode === "pdf" ? "bg-indigo-500 text-white border-indigo-500" : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"}`}
        >
          Subir PDF
        </button>
      </div>

      {mode === "pdf" && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            Sube un PDF con la relación de mesas. Los invitados podrán abrirlo en una nueva pestaña.
          </p>
          {pdfUrl ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800 flex items-center justify-between gap-2">
              <span>✓ PDF cargado</span>
              <div className="flex gap-2">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="underline text-indigo-600">Ver PDF</a>
                <button type="button" onClick={() => { onChangePdf(""); if (fileRef.current) fileRef.current.value = ""; }} className="text-red-500 hover:text-red-700">Cambiar</button>
              </div>
            </div>
          ) : null}
          <label className={`flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-3 cursor-pointer hover:border-indigo-400 transition-colors text-sm text-gray-500 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            {uploading ? <LoadingSpinner size="sm" className="text-gray-400" /> : null}
            {uploading ? "Subiendo..." : pdfUrl ? "Reemplazar PDF" : "Seleccionar PDF"}
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadPdf(f);
                e.target.value = "";
              }}
            />
          </label>
          {uploadError ? <p className="text-xs text-red-500">{uploadError}</p> : null}
        </div>
      )}

      {mode === "manual" && (
        <div className="space-y-3">
          {/* Carga masiva */}
          <details className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
            <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 select-none">
              ▶ Carga masiva (pegar desde Excel)
            </summary>
            <div className="px-3 pb-3 pt-2 space-y-2">
              <p className="text-[11px] text-gray-500">Una fila por línea, separado por coma, punto y coma o Tab.<br />Formato: <code>DNI, Nombre Apellido, Nro Mesa</code></p>
              <textarea
                className={`${inputCls} min-h-[80px] resize-y font-mono text-xs`}
                value={bulkText}
                onChange={e => { setBulkText(e.target.value); setBulkError(""); }}
                placeholder={"12345678, Juan Perez, 5\n87654321, Ana Garcia, 3"}
              />
              {bulkError ? <p className="text-xs text-red-500">{bulkError}</p> : null}
              <button
                type="button"
                onClick={parseBulk}
                disabled={!bulkText.trim()}
                className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 hover:bg-indigo-600"
              >
                Agregar filas
              </button>
            </div>
          </details>

          {/* Tabla */}
          {rows.length > 0 && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-500">DNI</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-500">Nombre y apellidos</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-gray-500 w-20">Mesa</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100 last:border-0">
                      <td className="px-1 py-1">
                        <input className={inputCls} maxLength={20} value={row.dni} onChange={e => updateRow(idx, "dni", e.target.value)} placeholder="DNI" />
                      </td>
                      <td className="px-1 py-1">
                        <input className={inputCls} maxLength={200} value={row.name} onChange={e => updateRow(idx, "name", e.target.value)} placeholder="Nombre Apellido" />
                      </td>
                      <td className="px-1 py-1">
                        <input className={inputCls} maxLength={20} value={row.tableNumber} onChange={e => updateRow(idx, "tableNumber", e.target.value)} placeholder="5" />
                      </td>
                      <td className="px-1 py-1 text-center">
                        <button type="button" onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600 text-base leading-none" aria-label="Eliminar fila">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            type="button"
            onClick={addRow}
            className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            + Agregar invitado
          </button>

          {rows.length > 0 && (
            <p className="text-[11px] text-gray-400 text-right">{rows.length} invitado{rows.length !== 1 ? "s" : ""} registrado{rows.length !== 1 ? "s" : ""}</p>
          )}
        </div>
      )}
    </div>
  );
}
