import { useState, useMemo } from "react";
import { Search, MapPin, Globe, Store, Factory, ChevronDown, ChevronUp, Star, Clock, ExternalLink, Navigation, Edit3, Heart, X, Filter } from "lucide-react";

// Types matching the schema
export interface ShopPhoto {
  url: string;
  alt?: string;
  attribution?: string;
  source?: string;
}

export interface ShopReview {
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  text: string;
  source: "google" | "community" | "verified";
}

export interface ShopHours {
  monday?: { open?: string; close?: string; closed?: boolean };
  tuesday?: { open?: string; close?: string; closed?: boolean };
  wednesday?: { open?: string; close?: string; closed?: boolean };
  thursday?: { open?: string; close?: string; closed?: boolean };
  friday?: { open?: string; close?: string; closed?: boolean };
  saturday?: { open?: string; close?: string; closed?: boolean };
  sunday?: { open?: string; close?: string; closed?: boolean };
  notes?: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  country: string;
  city: string;
  notes: string;
  website?: string;
  address?: string;
  brands: string[];
  categories: string[];
  physicalStore: boolean;
  onlineStore: boolean;
  shipsWorldwide?: boolean;
  foundedYear?: number;
  isManufacturer: boolean;
  region?: string;
  verified: boolean;
  lastVerified?: string;
  rating?: number;
  reviewCount?: number;
  hours?: ShopHours;
  languages: string[];
  paymentMethods: string[];
  taxFree?: boolean;
  returnPolicy?: string;
  sellsCategories: string[];
  photos: (string | ShopPhoto)[];
  reviews: ShopReview[];
}

interface Props {
  shops: Shop[];
  onShopSelect?: (shop: Shop) => void;
}

const categoryFilters = [
  { id: "balls", label: "Balls", icon: "🔴" },
  { id: "clubs", label: "Clubs", icon: "🎳" },
  { id: "diabolos", label: "Diabolo", icon: "🪀" },
  { id: "rings", label: "Rings", icon: "⭕" },
  { id: "poi", label: "Poi", icon: "🔵" },
  { id: "fire", label: "Fire Props", icon: "🔥" },
  { id: "led", label: "LED Props", icon: "💡" },
  { id: "unicycles", label: "Unicycle", icon: "🚲" },
  { id: "aerial", label: "Aerial / Circus", icon: "🎪" },
  { id: "magic", label: "Magic", icon: "🎩" },
];

const regionLabels: Record<string, string> = {
  europe: "Europe",
  "north-america": "North America",
  "south-america": "South America",
  asia: "Asia",
  oceania: "Oceania",
  africa: "Africa",
};

const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

function getOpenStatus(hours?: ShopHours): { isOpen: boolean; text: string } {
  if (!hours) return { isOpen: false, text: "" };
  
  const now = new Date();
  const dayName = dayNames[now.getDay()];
  const todayHours = hours[dayName];
  
  if (!todayHours || todayHours.closed) {
    return { isOpen: false, text: "Closed today" };
  }
  
  if (todayHours.open && todayHours.close) {
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(todayHours.open.replace(":", ""));
    const closeTime = parseInt(todayHours.close.replace(":", ""));
    
    if (currentTime >= openTime && currentTime < closeTime) {
      return { isOpen: true, text: `Open now · Closes ${todayHours.close}` };
    } else if (currentTime < openTime) {
      return { isOpen: false, text: `Closed · Opens ${todayHours.open}` };
    }
  }
  
  return { isOpen: false, text: "Closed" };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}
        />
      ))}
    </div>
  );
}

function ShopCard({ shop, isExpanded, onToggle }: { shop: Shop; isExpanded: boolean; onToggle: () => void }) {
  const openStatus = getOpenStatus(shop.hours);
  const photoUrl = shop.photos[0] 
    ? (typeof shop.photos[0] === "string" ? shop.photos[0] : shop.photos[0].url)
    : null;
  
  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden transition-all hover:border-[var(--color-brain-change)]/50">
      {/* Header */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-brain-change)]">
              {shop.city}, {shop.country}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <h3 className="font-display text-xl font-bold text-[var(--color-fg)]">{shop.name}</h3>
              {shop.verified && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500" title="Verified">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>

            {/* Rating - only show if we have our own verified rating system */}
            {/* For now, link to Google Maps for ratings */}
            
            {/* Badges */}
            <div className="mt-2 flex flex-wrap gap-2">
              {shop.physicalStore && (
                <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-400">
                  Physical store
                </span>
              )}
              {shop.onlineStore && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
                  Online store
                </span>
              )}
            </div>
            
            {/* Description */}
            <p className="mt-3 text-sm text-[var(--color-muted)] line-clamp-2">{shop.notes}</p>
            
            {/* Address & Hours */}
            <div className="mt-3 space-y-1 text-xs text-[var(--color-muted)]">
              {shop.address && (
                <p className="flex items-center gap-1.5">
                  <MapPin size={12} />
                  {shop.address}
                </p>
              )}
              {openStatus.text && (
                <p className="flex items-center gap-1.5">
                  <Clock size={12} />
                  <span className={openStatus.isOpen ? "text-emerald-400" : "text-[var(--color-muted)]"}>
                    {openStatus.text}
                  </span>
                </p>
              )}
              {shop.lastVerified && (
                <p className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Last verified: {formatDate(shop.lastVerified)}
                </p>
              )}
            </div>
          </div>

          {/* Photos grid */}
          {shop.photos.length > 0 && (
            <div className="hidden sm:grid grid-cols-2 gap-1 w-48 h-32 flex-shrink-0">
              {shop.photos.slice(0, 4).map((photo, i) => {
                const url = typeof photo === "string" ? photo : photo.url;
                const alt = typeof photo === "string" ? shop.name : (photo.alt || shop.name);
                return (
                  <div key={i} className="relative overflow-hidden rounded-lg bg-[var(--color-bg-elevated)]">
                    <img src={url} alt={alt} className="h-full w-full object-cover" loading="lazy" />
                    {i === 3 && shop.photos.length > 4 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm font-semibold">
                        +{shop.photos.length - 4} more
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Favorite + Expand */}
          <div className="flex flex-col items-center gap-2">
            <button className="p-2 rounded-full hover:bg-[var(--color-bg-elevated)] text-[var(--color-muted)] hover:text-[var(--color-fg)]">
              <Heart size={18} />
            </button>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {shop.website && (
            <a
              href={shop.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brain-change)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Website
            </a>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(shop.address || `${shop.name} ${shop.city}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-bg-elevated)]"
          >
            <Navigation size={14} />
            Directions
          </a>
          <button
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-bg-elevated)]"
          >
            <Edit3 size={14} />
            Suggest edit
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)]/50 p-4">
          <div className="grid gap-6 md:grid-cols-4">
            {/* What they sell */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">What They Sell</h4>
              <div className="space-y-1">
                {shop.sellsCategories.length > 0 ? (
                  shop.sellsCategories.map((cat) => (
                    <p key={cat} className="flex items-center gap-2 text-sm text-[var(--color-fg)]">
                      <span className="text-[var(--color-brain-change)]">•</span>
                      {cat}
                    </p>
                  ))
                ) : (
                  shop.categories.slice(0, 6).map((cat) => (
                    <p key={cat} className="flex items-center gap-2 text-sm text-[var(--color-fg)]">
                      <span className="text-[var(--color-brain-change)]">•</span>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </p>
                  ))
                )}
              </div>
            </div>
            
            {/* Brands */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">Brands Carried</h4>
              <div className="flex flex-wrap gap-1.5">
                {shop.brands.slice(0, 8).map((brand) => (
                  <span key={brand} className="rounded-md bg-[var(--color-bg-elevated)] px-2 py-1 text-xs text-[var(--color-fg)]">
                    {brand}
                  </span>
                ))}
                {shop.brands.length > 8 && (
                  <span className="text-xs text-[var(--color-brain-change)]">And more...</span>
                )}
              </div>
            </div>

            {/* Community reviews */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">Reviews</h4>
              <div className="space-y-3">
                {shop.reviews.length > 0 ? (
                  // Only show reviews that were submitted directly to us with permission
                  shop.reviews.slice(0, 2).map((review, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                        {review.author.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--color-fg)]">{review.author}</span>
                          <StarRating rating={review.rating} size={10} />
                          <span className="text-xs text-[var(--color-muted)]">{formatDate(review.date)}</span>
                        </div>
                        <p className="text-xs text-[var(--color-muted)] line-clamp-2">{review.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--color-muted)]">No community reviews yet</p>
                )}
                {/* Link to Google Maps for external reviews */}
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(shop.name + " " + shop.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--color-brain-change)] hover:underline"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  View on Google Maps →
                </a>
              </div>
            </div>

            {/* Quick info */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">Quick Info</h4>
              <div className="space-y-1 text-xs">
                {shop.languages.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Languages</span>
                    <span className="text-[var(--color-fg)]">{shop.languages.join(", ")}</span>
                  </div>
                )}
                {shop.paymentMethods.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Payment</span>
                    <span className="text-[var(--color-fg)]">{shop.paymentMethods.join(", ")}</span>
                  </div>
                )}
                {shop.taxFree !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Tax Free</span>
                    <span className="text-[var(--color-fg)]">{shop.taxFree ? "Yes (for non EU)" : "No"}</span>
                  </div>
                )}
                {shop.shipsWorldwide !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Shipping</span>
                    <span className="text-[var(--color-fg)]">{shop.shipsWorldwide ? "Worldwide" : "Local"}</span>
                  </div>
                )}
                {shop.returnPolicy && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Returns</span>
                    <span className="text-[var(--color-fg)]">{shop.returnPolicy}</span>
                  </div>
                )}
                {shop.website && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Website</span>
                    <a href={shop.website} target="_blank" rel="noopener noreferrer" className="text-[var(--color-brain-change)] hover:underline truncate max-w-[120px]">
                      {new URL(shop.website).hostname}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Photo gallery */}
          {shop.photos.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {shop.photos.map((photo, i) => {
                  const url = typeof photo === "string" ? photo : photo.url;
                  const alt = typeof photo === "string" ? shop.name : (photo.alt || shop.name);
                  const attribution = typeof photo === "string" ? null : photo.attribution;
                  return (
                    <div key={i} className="relative flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden group">
                      <img src={url} alt={alt} className="h-full w-full object-cover" loading="lazy" />
                      {attribution && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 text-[8px] text-white/70 opacity-0 group-hover:opacity-100 transition">
                          Photo: {attribution}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Footer actions */}
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <a
              href={`https://github.com/mzzavaa/the-juggling-company/issues/new?template=shop-update.yml&title=Update:+${encodeURIComponent(shop.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)]"
            >
              <Edit3 size={12} />
              Edit this shop on GitHub
            </a>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brain-change)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
              Add a review
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default function ShopDirectory({ shops, onShopSelect }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [filterPhysical, setFilterPhysical] = useState(false);
  const [filterOnline, setFilterOnline] = useState(false);
  const [filterShipsWorldwide, setFilterShipsWorldwide] = useState(false);
  const [expandedShopId, setExpandedShopId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Calculate region counts
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    shops.forEach((shop) => {
      const region = shop.region || "europe"; // default to europe if not set
      counts[region] = (counts[region] || 0) + 1;
    });
    return counts;
  }, [shops]);
  
  // Filter shops
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches = 
          shop.name.toLowerCase().includes(q) ||
          shop.city.toLowerCase().includes(q) ||
          shop.country.toLowerCase().includes(q) ||
          shop.brands.some((b) => b.toLowerCase().includes(q));
        if (!matches) return false;
      }
      
      // Category filter
      if (selectedCategories.length > 0) {
        const hasCategory = selectedCategories.some((cat) => shop.categories.includes(cat));
        if (!hasCategory) return false;
      }
      
      // Region filter
      if (selectedRegion && shop.region !== selectedRegion) return false;
      
      // Store type filters
      if (filterPhysical && !shop.physicalStore) return false;
      if (filterOnline && !shop.onlineStore) return false;
      if (filterShipsWorldwide && !shop.shipsWorldwide) return false;
      
      return true;
    });
  }, [shops, searchQuery, selectedCategories, selectedRegion, filterPhysical, filterOnline, filterShipsWorldwide]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedRegion(null);
    setFilterPhysical(false);
    setFilterOnline(false);
    setFilterShipsWorldwide(false);
  };

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || selectedRegion || filterPhysical || filterOnline || filterShipsWorldwide;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Sidebar - Browse by Region */}
      <aside className="lg:w-64 flex-shrink-0">
        <div className="sticky top-24 space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-3">Browse by Region</h3>
            <div className="space-y-1">
              {Object.entries(regionLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedRegion(selectedRegion === key ? null : key)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                    selectedRegion === key
                      ? "bg-[var(--color-brain-change)] text-white"
                      : "hover:bg-[var(--color-bg-elevated)] text-[var(--color-fg)]"
                  }`}
                >
                  <span>{label}</span>
                  <span className={selectedRegion === key ? "text-white/70" : "text-[var(--color-muted)]"}>
                    {regionCounts[key] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Open source badge */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-fg)]">Open source & community maintained</p>
                <p className="text-xs text-[var(--color-muted)] mt-1">Help improve this directory on GitHub.</p>
              </div>
            </div>
            <a
              href="https://github.com/mzzavaa/the-juggling-company"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--color-brain-change)] hover:underline"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Search and filters bar */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)]" />
              <input
                type="text"
                placeholder="Search shops, cities, countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-brain-change)] focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                showFilters || hasActiveFilters
                  ? "border-[var(--color-brain-change)] bg-[var(--color-brain-change)]/10 text-[var(--color-brain-change)]"
                  : "border-[var(--color-border)] text-[var(--color-fg)] hover:bg-[var(--color-bg-elevated)]"
              }`}
            >
              <Filter size={16} />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 h-5 w-5 rounded-full bg-[var(--color-brain-change)] text-white text-xs flex items-center justify-center">
                  {(selectedCategories.length > 0 ? 1 : 0) + (selectedRegion ? 1 : 0) + (filterPhysical ? 1 : 0) + (filterOnline ? 1 : 0) + (filterShipsWorldwide ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Quick filter toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterPhysical(!filterPhysical)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filterPhysical
                  ? "bg-[var(--color-brain-change)] text-white"
                  : "bg-[var(--color-bg-elevated)] text-[var(--color-fg)] hover:bg-[var(--color-bg-elevated)]/80"
              }`}
            >
              <Store size={12} />
              Physical store
            </button>
            <button
              onClick={() => setFilterOnline(!filterOnline)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filterOnline
                  ? "bg-[var(--color-brain-change)] text-white"
                  : "bg-[var(--color-bg-elevated)] text-[var(--color-fg)] hover:bg-[var(--color-bg-elevated)]/80"
              }`}
            >
              <Globe size={12} />
              Online
            </button>
            <button
              onClick={() => setFilterShipsWorldwide(!filterShipsWorldwide)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filterShipsWorldwide
                  ? "bg-[var(--color-brain-change)] text-white"
                  : "bg-[var(--color-bg-elevated)] text-[var(--color-fg)] hover:bg-[var(--color-bg-elevated)]/80"
              }`}
            >
              <Globe size={12} />
              Ships worldwide
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-[var(--color-brain-change)] hover:underline"
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>

          {/* Category pills */}
          {(showFilters || selectedCategories.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    selectedCategories.includes(cat.id)
                      ? "bg-[var(--color-brain-change)] text-white"
                      : "bg-[var(--color-bg-elevated)] text-[var(--color-fg)] hover:bg-[var(--color-bg-elevated)]/80"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-[var(--color-muted)]">
            Showing <span className="font-semibold text-[var(--color-fg)]">{filteredShops.length}</span> of {shops.length} shops
            {selectedRegion && <span> in {regionLabels[selectedRegion]}</span>}
          </p>
        </div>
        
        {/* Shop cards */}
        <div className="space-y-4">
          {filteredShops.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              isExpanded={expandedShopId === shop.id}
              onToggle={() => setExpandedShopId(expandedShopId === shop.id ? null : shop.id)}
            />
          ))}
          
          {filteredShops.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] p-12 text-center">
              <p className="text-lg font-semibold text-[var(--color-fg)]">No shops found</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">Try adjusting your filters or search query.</p>
              <button onClick={clearFilters} className="mt-4 text-sm text-[var(--color-brain-change)] hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
