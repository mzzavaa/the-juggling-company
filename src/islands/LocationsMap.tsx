import { useEffect, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<MapLocation | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    (async () => {
      // Leaflet touches window on import — must be dynamic (browser-only)
      const { default: L } = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (destroyed || !containerRef.current) return;

      const map = L.map(containerRef.current, { center: [20, 10], zoom: 2 });

      // CARTO dark basemap - reliable on hosted sites (OSM's public tiles block
      // hotlinking, which left the map blank) and matches the site's dark theme.
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      locations.forEach((loc) => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
          <circle cx="12" cy="12" r="10" fill="${typeColor[loc.type]}" stroke="white" stroke-width="2"/>
          <line x1="12" y1="22" x2="12" y2="31" stroke="${typeColor[loc.type]}" stroke-width="2.5" stroke-linecap="round"/>
        </svg>`;
        const icon = L.divIcon({
          html: svg,
          className: "",
          iconSize: [24, 32],
          iconAnchor: [12, 31],
        });
        L.marker([loc.lat, loc.lng], { icon, title: loc.name })
          .on("click", () => setSelected(loc))
          .addTo(map);
      });

      if (locations.length > 0) {
        const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
      }

      return () => { map.remove(); };
    })();

    return () => { destroyed = true; };
  }, []);

  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-xl border border-[var(--color-border)]">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {selected && (
        <aside
          className="absolute right-4 top-4 z-[1000] max-w-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl"
          role="dialog"
          aria-label={`Details for ${selected.name}`}
        >
          <button
            type="button"
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-fg"
            onClick={() => setSelected(null)}
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: typeColor[selected.type] }}>
            {typeLabel[selected.type]}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-fg">{selected.name}</h3>
          <p className="text-sm text-[var(--color-muted)]">{selected.city}, {selected.country}</p>
          {selected.notes && <p className="mt-2 text-sm text-fg">{selected.notes}</p>}
          {selected.website && (
            <a
              href={selected.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-2"
              style={{ color: typeColor[selected.type] }}
            >
              Visit website
            </a>
          )}
        </aside>
      )}

      <div className="pointer-events-none absolute bottom-8 left-4 z-[1000] flex flex-wrap gap-2 rounded-xl bg-[var(--color-bg)]/95 p-3 text-xs shadow-lg">
        {(Object.keys(typeColor) as MapLocation["type"][]).map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: typeColor[t] }} />
            {typeLabel[t]}
          </span>
        ))}
      </div>
    </div>
  );
}
