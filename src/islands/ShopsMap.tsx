import { useEffect, useRef, useState } from "react";
// Import map CSS statically so it is reliably bundled. Importing these
// dynamically left MarkerCluster's CSS out of the build, which 404'd at runtime
// and crashed the map with "Failed to load map".
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

export interface MapShop {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  type: "juggling-shop" | "workshop" | "past-performance" | "home-base";
  physicalStore?: boolean;
  website?: string;
}

interface Props {
  shops: MapShop[];
  onShopClick?: (shop: MapShop) => void;
  selectedShopId?: string | null;
}

const typeColors = {
  "juggling-shop": "#a855f7",
  workshop: "#3b82f6",
  "past-performance": "#f97316",
  "home-base": "#ef4444",
};

const typeLabels = {
  "juggling-shop": "Juggling shop",
  workshop: "Workshop / School",
  "past-performance": "Past performance",
  "home-base": "Home base",
};

export default function ShopsMap({ shops, onShopClick, selectedShopId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    (async () => {
      try {
        const { default: L } = await import("leaflet");

        // leaflet.markercluster extends the global L, so expose it before import.
        (window as unknown as { L: typeof L }).L = L;
        await import("leaflet.markercluster");

        if (destroyed || !containerRef.current) return;

        // Create map with dark theme
        const map = L.map(containerRef.current, {
          center: [30, 0],
          zoom: 2,
          zoomControl: true,
          attributionControl: true,
        });
        mapRef.current = map;

        // Dark tile layer
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(map);

        // Create marker cluster group with custom styling
        // @ts-ignore - markerClusterGroup is added to L by the plugin
        const clusterGroup = L.markerClusterGroup({
          chunkedLoading: true,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          maxClusterRadius: 50,
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount();
            let size = "small";
            if (count >= 10) size = "medium";
            if (count >= 50) size = "large";
            
            const sizes = { small: 36, medium: 44, large: 52 };
            const dim = sizes[size as keyof typeof sizes];
            
            return L.divIcon({
              html: `<div class="cluster-icon cluster-${size}">${count}</div>`,
              className: "custom-cluster",
              iconSize: L.point(dim, dim),
            });
          },
        });

      // Add markers for each shop
      shops.forEach((shop) => {
        const color = typeColors[shop.type] || typeColors["juggling-shop"];
        
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>
          <circle cx="14" cy="14" r="6" fill="white"/>
        </svg>`;
        
        const icon = L.divIcon({
          html: svg,
          className: "shop-marker",
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -36],
        });

        const marker = L.marker([shop.lat, shop.lng], { icon })
          .bindPopup(`
            <div style="min-width: 180px;">
              <p style="font-size: 10px; color: ${color}; text-transform: uppercase; font-weight: 600; margin: 0 0 4px 0;">
                ${typeLabels[shop.type]}
              </p>
              <h3 style="font-size: 14px; font-weight: 700; margin: 0 0 4px 0;">${shop.name}</h3>
              <p style="font-size: 12px; color: #888; margin: 0;">${shop.city}, ${shop.country}</p>
              ${shop.website ? `<a href="${shop.website}" target="_blank" rel="noopener" style="font-size: 12px; color: ${color}; display: block; margin-top: 8px;">Visit website →</a>` : ""}
            </div>
          `);
        
        if (onShopClick) {
          marker.on("click", () => onShopClick(shop));
        }
        
        clusterGroup.addLayer(marker);
      });

      map.addLayer(clusterGroup);

      // Fit bounds if we have locations
      if (shops.length > 0) {
        const bounds = L.latLngBounds(shops.map((s) => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
      }

      setIsLoading(false);

      return () => {
        map.remove();
      };
      } catch (error) {
        console.error("Error loading map:", error);
        setError("Failed to load map. Please refresh the page.");
        setIsLoading(false);
      }
    })();

    return () => {
      destroyed = true;
    };
  }, [shops]);

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-xl border border-[var(--color-border)]">
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-bg)]">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brain-change)] border-t-transparent" />
            <p className="mt-2 text-sm text-[var(--color-muted)]">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-bg)]">
          <div className="text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}
      
      {/* Map container */}
      <div ref={containerRef} className="absolute inset-0 z-0" />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] rounded-xl bg-[var(--color-bg)]/95 p-3 shadow-lg backdrop-blur">
        <div className="space-y-1.5">
          {Object.entries(typeLabels).map(([type, label]) => (
            <div key={type} className="flex items-center gap-2 text-xs">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: typeColors[type as keyof typeof typeColors] }}
              />
              <span className="text-[var(--color-fg)]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom cluster styles */}
      <style>{`
        .custom-cluster {
          background: transparent !important;
        }
        .cluster-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7 0%, #06b6d4 100%);
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
        }
        .cluster-small {
          width: 36px;
          height: 36px;
          font-size: 12px;
        }
        .cluster-medium {
          width: 44px;
          height: 44px;
          font-size: 14px;
        }
        .cluster-large {
          width: 52px;
          height: 52px;
          font-size: 16px;
        }
        .shop-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          background: var(--color-bg-card, #1a1a2e);
          border: 1px solid var(--color-border, #333);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }
        .leaflet-popup-content {
          margin: 12px 14px;
          color: var(--color-fg, #fff);
        }
        .leaflet-popup-tip {
          background: var(--color-bg-card, #1a1a2e);
          border: 1px solid var(--color-border, #333);
        }
        .leaflet-container {
          background: var(--color-bg, #0d0d1a);
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
