"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string; // URL embed actual (puede estar vacia)
  onChange: (embedUrl: string, address: string) => void;
};

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

function buildEmbedUrl(lat: number, lng: number) {
  return `https://maps.google.com/maps?q=${lat},${lng}&output=embed&z=16`;
}

export default function MapPicker({ value, onChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Inicializar Leaflet en el cliente
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    import("leaflet").then((L) => {
      // Corregir iconos de Leaflet rotos en Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [-12.0464, -77.0428], // Lima por defecto
        zoom: 12,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Click en el mapa coloca marcador y genera embed URL
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng;
        placeMarker(L, map, lat, lng, "Ubicacion seleccionada");
      });

      leafletRef.current = { map, L };
      setMapReady(true);
    });

    return () => {
      leafletRef.current?.map?.remove();
      leafletRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function placeMarker(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map: any,
    lat: number,
    lng: number,
    address: string
  ) {
    if (markerRef.current) {
      markerRef.current.remove();
    }

    markerRef.current = L.marker([lat, lng]).addTo(map).bindPopup(address).openPopup();
    map.setView([lat, lng], 16);

    setCoords({ lat, lng });
    setSelectedAddress(address);
    onChange(buildEmbedUrl(lat, lng), address);
  }

  async function search() {
    const q = query.trim();
    if (!q) return;

    setSearching(true);
    setResults([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
        { headers: { "Accept-Language": "es", "User-Agent": "InvitaStudio/1.0" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function selectResult(result: NominatimResult) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const address = result.display_name;
    setResults([]);
    setQuery(address.split(",").slice(0, 3).join(","));

    if (leafletRef.current) {
      placeMarker(leafletRef.current.L, leafletRef.current.map, lat, lng, address);
    }
  }

  return (
    <div className="space-y-2">
      {/* Barra de busqueda */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void search()}
          placeholder="Busca una dirección o lugar..."
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          type="button"
          onClick={() => void search()}
          disabled={searching}
          className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          {searching ? "..." : "Buscar"}
        </button>
      </div>

      {/* Resultados de búsqueda */}
      {results.length > 0 && (
        <ul className="rounded-lg border border-gray-200 bg-white shadow-md text-sm overflow-hidden">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => selectResult(r)}
                className="w-full px-3 py-2 text-left hover:bg-indigo-50 border-b border-gray-100 last:border-0"
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Hint */}
      <p className="text-xs text-gray-400">
        {mapReady
          ? "También puedes hacer clic directamente en el mapa para ajustar la ubicación."
          : "Cargando mapa..."}
      </p>

      {/* Mapa Leaflet */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={mapRef}
        className="h-64 w-full rounded-xl border border-gray-200 overflow-hidden"
        style={{ zIndex: 0 }}
      />

      {/* Coordenadas seleccionadas */}
      {coords && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-800">
          <span className="font-semibold">✓ Ubicación guardada:</span> {selectedAddress.split(",").slice(0, 3).join(",")}
          <br />
          <span className="opacity-70">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
        </div>
      )}

      {/* Mostrar preview del embed actual si hay URL */}
      {value && !coords && (
        <p className="text-xs text-gray-400">
          URL embed actual configurada. Busca una nueva dirección para reemplazarla.
        </p>
      )}
    </div>
  );
}
