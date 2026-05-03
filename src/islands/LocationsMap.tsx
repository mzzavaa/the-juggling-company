import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";

export interface MapLocation {
  slug: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  type: "past-performance" | "home-base" | "available" | "workshop";
  notes: string;
}

interface Props {
  locations: MapLocation[];
}

const typeColor: Record<MapLocation["type"], string> = {
  "past-performance": "#d97706", // amber-600
  "home-base": "#dc2626", // red-600
  available: "#10b981", // emerald-500
  workshop: "#2563eb", // blue-600
};

const typeLabel: Record<MapLocation["type"], string> = {
  "past-performance": "Past performance",
  "home-base": "Home base",
  available: "Available",
  workshop: "Workshop",
};

export default function LocationsMap({ locations }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [selected, setSelected] = useState<MapLocation | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    let markers: Marker[] = [];

    (async () => {
      const maplibre = await import("maplibre-gl");
      await import("maplibre-gl/dist/maplibre-gl.css");
      if (cancelled || !containerRef.current) return;

      const map = new maplibre.Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: [10, 30],
        zoom: 1.5,
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        markers = locations.map((loc) => {
          const el = document.createElement("button");
          el.type = "button";
          el.setAttribute("aria-label", `${loc.name} (${typeLabel[loc.type]})`);
          el.style.cssText = `width:18px;height:18px;border-radius:9999px;border:2px solid white;background:${typeColor[loc.type]};box-shadow:0 1px 3px rgba(0,0,0,0.3);cursor:pointer;`;
          el.addEventListener("click", () => setSelected(loc));
          const marker = new maplibre.Marker({ element: el })
            .setLngLat([loc.lng, loc.lat])
            .addTo(map);
          return marker;
        });

        if (locations.length > 0) {
          const bounds = new maplibre.LngLatBounds();
          for (const loc of locations) bounds.extend([loc.lng, loc.lat]);
          map.fitBounds(bounds, { padding: 60, maxZoom: 6, duration: 0 });
        }
      });
    })();

    return () => {
      cancelled = true;
      markers.forEach((m) => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [locations]);

  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-lg border border-[var(--color-border)]">
      <div ref={containerRef} className="absolute inset-0" />
      {selected && (
        <aside
          className="absolute right-4 top-4 z-10 max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-xl"
          role="dialog"
          aria-label={`Details for ${selected.name}`}
        >
          <button
            type="button"
            className="absolute right-2 top-2 text-[var(--color-muted)] hover:text-[var(--color-fg)]"
            onClick={() => setSelected(null)}
            aria-label="Close"
          >
            ×
          </button>
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: typeColor[selected.type] }}
          >
            {typeLabel[selected.type]}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-[var(--color-fg)]">
            {selected.name}
          </h3>
          <p className="text-sm text-[var(--color-muted)]">
            {selected.city}, {selected.country}
          </p>
          {selected.notes && (
            <p className="mt-2 text-sm text-[var(--color-fg)]">{selected.notes}</p>
          )}
        </aside>
      )}
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 rounded-lg bg-[var(--color-bg)]/90 p-3 text-xs">
        {(Object.keys(typeColor) as MapLocation["type"][]).map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: typeColor[t] }}
            />
            {typeLabel[t]}
          </span>
        ))}
      </div>
    </div>
  );
}
