import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";

export interface MapLocation {
  slug: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  type: "past-performance" | "home-base" | "available" | "workshop" | "juggling-shop";
  notes: string;
  website?: string;
}

interface Props {
  locations: MapLocation[];
}

const typeColor: Record<MapLocation["type"], string> = {
  "past-performance": "#d97706",
  "home-base": "#dc2626",
  available: "#10b981",
  workshop: "#2563eb",
  "juggling-shop": "#9333ea",
};

const typeLabel: Record<MapLocation["type"], string> = {
  "past-performance": "Past performance",
  "home-base": "Home base",
  available: "Available",
  workshop: "Workshop",
  "juggling-shop": "Juggling shop",
};

export default function LocationsMap({ locations }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [selected, setSelected] = useState<MapLocation | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Stable ref to avoid re-creating the map when the locations array identity changes
  const locationsRef = useRef(locations);
  locationsRef.current = locations;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    let markers: Marker[] = [];

    (async () => {
      try {
        const ml = await import("maplibre-gl");
        // maplibre-gl ships CJS; dynamic import wraps it under .default
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maplibre = (ml as any).default ?? ml;
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

        map.on("error", (e) => {
          console.error("MapLibre error:", e);
        });

        map.on("load", () => {
          if (cancelled) return;
          // Force correct canvas dimensions after hydration
          map.resize();

          const locs = locationsRef.current;
          markers = locs.map((loc) => {
            const el = document.createElement("button");
            el.type = "button";
            el.setAttribute("aria-label", `${loc.name} (${typeLabel[loc.type]})`);
            el.style.cssText = `width:18px;height:18px;border-radius:9999px;border:2px solid white;background:${typeColor[loc.type]};box-shadow:0 1px 3px rgba(0,0,0,0.3);cursor:pointer;`;
            el.addEventListener("click", () => setSelected(loc));
            return new maplibre.Marker({ element: el })
              .setLngLat([loc.lng, loc.lat])
              .addTo(map);
          });

          if (locs.length > 0) {
            const bounds = new maplibre.LngLatBounds();
            for (const loc of locs) bounds.extend([loc.lng, loc.lat]);
            map.fitBounds(bounds, { padding: 60, maxZoom: 6, duration: 0 });
          }
        });
      } catch (err) {
        console.error("Map init failed:", err);
        setMapError("Map could not be loaded.");
      }
    })();

    return () => {
      cancelled = true;
      markers.forEach((m) => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-lg border border-[var(--color-border)]">
      {mapError ? (
        <div className="flex h-full items-center justify-center text-muted">
          {mapError}
        </div>
      ) : (
        <div ref={containerRef} className="absolute inset-0" />
      )}
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
          {selected.website && (
            <a
              href={selected.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-medium underline underline-offset-2"
              style={{ color: typeColor[selected.type] }}
            >
              Visit website →
            </a>
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
