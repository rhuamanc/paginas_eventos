"use client";

import { useState, useRef, useEffect } from "react";

type FontOption = {
  label: string;
  value: string;
  preview?: string; // texto de muestra; por defecto usa label
};

const FONT_GROUPS: { groupLabel: string; options: FontOption[] }[] = [
  {
    groupLabel: "Cursivas / Script",
    options: [
      { label: "Dancing Script", value: "var(--font-dancing-script), cursive", preview: "Dancing Script" },
      { label: "Great Vibes", value: "var(--font-great-vibes), cursive", preview: "Great Vibes" },
      { label: "Satisfy", value: "var(--font-satisfy), cursive", preview: "Satisfy" },
      { label: "Pacifico", value: "var(--font-pacifico), cursive", preview: "Pacifico" },
    ],
  },
  {
    groupLabel: "Serif elegantes",
    options: [
      { label: "Georgia (predeterminada)", value: "", preview: "Georgia" },
      { label: "Playfair Display", value: "var(--font-playfair), serif", preview: "Playfair Display" },
      { label: "Lora", value: "var(--font-lora), serif", preview: "Lora" },
      { label: "Times New Roman", value: "'Times New Roman', serif", preview: "Times New Roman" },
      { label: "Palatino", value: "'Palatino Linotype', serif", preview: "Palatino" },
      { label: "Garamond", value: "Garamond, serif", preview: "Garamond" },
    ],
  },
  {
    groupLabel: "Sans-serif modernas",
    options: [
      { label: "Arial", value: "Arial, sans-serif", preview: "Arial" },
      { label: "Helvetica", value: "'Helvetica Neue', sans-serif", preview: "Helvetica" },
      { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif", preview: "Trebuchet MS" },
      { label: "Verdana", value: "Verdana, sans-serif", preview: "Verdana" },
      { label: "Century Gothic", value: "'Century Gothic', sans-serif", preview: "Century Gothic" },
    ],
  },
  {
    groupLabel: "Otras",
    options: [
      { label: "Courier New", value: "'Courier New', monospace", preview: "Courier New" },
    ],
  },
];

const ALL_OPTIONS = FONT_GROUPS.flatMap(g => g.options);

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function FontPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = ALL_OPTIONS.find(o => o.value === value) ?? ALL_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <span style={{ fontFamily: selected.value || "Georgia, serif", fontSize: "1.05em" }}>
          {selected.preview ?? selected.label}
        </span>
        <svg className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {FONT_GROUPS.map(group => (
            <div key={group.groupLabel}>
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
                {group.groupLabel}
              </p>
              {group.options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-base hover:bg-indigo-50 transition-colors ${opt.value === value ? "bg-indigo-50 text-indigo-700" : "text-gray-800"}`}
                  style={{ fontFamily: opt.value || "Georgia, serif" }}
                >
                  {opt.preview ?? opt.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
