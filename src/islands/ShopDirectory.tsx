import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import {
  Search,
  MapPin,
  Globe,
  Store,
  ChevronDown,
  ChevronUp,
  Navigation,
  Edit3,
  X,
  Github,
  LayoutGrid,
  List as ListIcon,
  ShieldCheck,
  ExternalLink,
  PlusCircle,
  Camera,
  Star,
} from "lucide-react";

// ---- Types (match the content schema) ----
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
}

const REPO = "https://github.com/mzzavaa/the-juggling-company";
const ADD_SHOP = `${REPO}/issues/new?template=shop-submission.yml`;
const EDIT_SHOP = `${REPO}/issues/new?template=shop-update.yml`;

// ---- Custom line-SVG icons for each juggling prop (cohesive set, no emoji) ----
const PROP_PATHS: Record<string, ReactNode> = {
  balls: (
    <>
      <circle cx="12" cy="6.5" r="2.3" />
      <circle cx="6.8" cy="15.5" r="2.3" />
      <circle cx="17.2" cy="15.5" r="2.3" />
    </>
  ),
  clubs: (
    <>
      <path d="M12 3c-1.6 0-2.2 1.6-2.2 3.1 0 1 .3 1.8.5 2.5C9 12 8.3 16 8.3 21" />
      <path d="M12 3c1.6 0 2.2 1.6 2.2 3.1 0 1-.3 1.8-.5 2.5C15 12 15.7 16 15.7 21" />
      <path d="M8.3 21h7.4" />
    </>
  ),
  diabolos: (
    <>
      <path d="M6 4h12M6 20h12" />
      <path d="M8 4c0 4 4 5.5 4 8s-4 4-4 8" />
      <path d="M16 4c0 4-4 5.5-4 8s4 4 4 8" />
    </>
  ),
  rings: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
    </>
  ),
  poi: (
    <>
      <path d="M4 4l7.5 9" />
      <circle cx="14.5" cy="16" r="3.5" />
    </>
  ),
  staff: (
    <>
      <path d="M5 19 19 5" />
      <circle cx="4.5" cy="19.5" r="1.3" />
      <circle cx="19.5" cy="4.5" r="1.3" />
    </>
  ),
  contact: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 9.5a4.5 4.5 0 0 1 3.5-2" />
    </>
  ),
  fire: <path d="M12 3c.5 2.5 2 3.8 3.2 5.2C16.3 9.4 17 10.9 17 12.7a5 5 0 0 1-10 0c0-1.3.5-2.4 1.3-3.2C9.4 8.4 10 7.2 10 6c1 1 1.3 2 2 3 .3-2 0-4 0-6Z" />,
  led: (
    <>
      <path d="M9.5 18.5h5M10.5 21h3" />
      <path d="M12 3a6 6 0 0 0-3.7 10.7c.5.5.9 1.1 1 1.8h5.4c.1-.7.5-1.3 1-1.8A6 6 0 0 0 12 3Z" />
    </>
  ),
  flowersticks: (
    <>
      <path d="M4.5 19.5 19.5 4.5" />
      <path d="M19.5 4.5l-2.3.4M19.5 4.5l-.4 2.3M4.5 19.5l2.3-.4M4.5 19.5l.4-2.3" />
    </>
  ),
  unicycles: (
    <>
      <circle cx="12" cy="15.5" r="5.5" />
      <path d="M12 10V5.5M9.5 5h5" />
    </>
  ),
  aerial: (
    <>
      <path d="M4 20h16" />
      <path d="M12 3 5 20M12 3l7 17M12 3v17" />
      <path d="M8.5 12c1.8 1.4 5.2 1.4 7 0" />
    </>
  ),
  "cigar-boxes": (
    <>
      <rect x="4" y="8" width="16" height="10" rx="1.2" />
      <path d="M4 11.5h16" />
      <path d="M10 8V6h4v2" />
    </>
  ),
  hats: (
    <>
      <path d="M8.5 3.5h7v9.5h-7z" />
      <path d="M4.5 16.2c2-1.1 13-1.1 15 0" />
      <path d="M8.5 13c1.2.8 5.8.8 7 0" />
    </>
  ),
  magic: (
    <>
      <path d="M5 19 14.5 9.5" />
      <path d="M17.5 3l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4L16 6.2l2.4-.8z" />
    </>
  ),
  general: (
    <>
      <circle cx="8" cy="8" r="3" />
      <rect x="13" y="13" width="6" height="6" rx="1" />
      <path d="M14 4h6M17 4v6" />
    </>
  ),
};

function PropIcon({ id, size = 16, className = "" }: { id: string; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PROP_PATHS[id] || PROP_PATHS.general}
    </svg>
  );
}

// Category metadata: id + human label (icon rendered via <PropIcon>). Order = display order.
const CATEGORY_META: { id: string; label: string }[] = [
  { id: "balls", label: "Juggling balls" },
  { id: "clubs", label: "Clubs" },
  { id: "diabolos", label: "Diabolo" },
  { id: "rings", label: "Rings" },
  { id: "poi", label: "Poi / flow" },
  { id: "staff", label: "Staff" },
  { id: "contact", label: "Contact" },
  { id: "fire", label: "Fire props" },
  { id: "led", label: "LED props" },
  { id: "flowersticks", label: "Flower / devil sticks" },
  { id: "unicycles", label: "Unicycle" },
  { id: "aerial", label: "Aerial / circus" },
  { id: "cigar-boxes", label: "Cigar boxes" },
  { id: "hats", label: "Hats" },
  { id: "magic", label: "Magic" },
  { id: "general", label: "General" },
];
const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(CATEGORY_META.map((c) => [c.id, c.label]));

type ShopBucket = "physical" | "online" | "hybrid" | "other";
function shopBucket(s: Shop): ShopBucket {
  if (s.physicalStore && s.onlineStore) return "hybrid";
  if (s.physicalStore) return "physical";
  if (s.onlineStore) return "online";
  return "other";
}

// ---- Filter sidebar building blocks ----
function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--color-border)] pb-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-1 text-left">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brain-change)]">{title}</span>
        {open ? (
          <ChevronUp size={14} className="text-[var(--color-muted)]" />
        ) : (
          <ChevronDown size={14} className="text-[var(--color-muted)]" />
        )}
      </button>
      {open && <div className="mt-2 space-y-1">{children}</div>}
    </div>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
  iconNode,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
  iconNode?: ReactNode;
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition hover:bg-[var(--color-bg-elevated)]"
    >
      <span className="flex items-center gap-2 text-sm text-[var(--color-fg)]">
        <span
          className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition ${
            checked ? "border-[var(--color-brain-change)] bg-[var(--color-brain-change)]" : "border-[var(--color-border)]"
          }`}
        >
          {checked && (
            <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
        {iconNode && <span className="text-[var(--color-muted)]">{iconNode}</span>}
        <span>{label}</span>
      </span>
      <span className="text-xs tabular-nums text-[var(--color-muted)]">{count}</span>
    </button>
  );
}

// ---- Shop card (no third-party imagery; renders owner-supplied photos if present) ----
function ShopCard({ shop }: { shop: Shop }) {
  const photo = shop.photos[0];
  const photoUrl = photo ? (typeof photo === "string" ? photo : photo.url) : null;
  const photoAttr = photo && typeof photo !== "string" ? photo.attribution : null;
  const bucket = shopBucket(shop);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-colors hover:border-[var(--color-brain-change)]/60">
      {/* Branded header: owner photo if present, else accent strip with prop icons */}
      {photoUrl ? (
        <div className="relative h-32 w-full overflow-hidden bg-[var(--color-bg-elevated)]">
          <img src={photoUrl} alt={shop.name} loading="lazy" className="h-full w-full object-cover" />
          {photoAttr && (
            <span className="absolute bottom-1 right-1 inline-flex items-center gap-1 rounded bg-black/60 px-1 py-0.5 text-[8px] text-white/80">
              <Camera size={9} /> {photoAttr}
            </span>
          )}
        </div>
      ) : (
        <div className="flex h-14 items-center gap-3 overflow-hidden border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-brain-change)]/20 via-transparent to-cyan-500/10 px-4 text-[var(--color-brain-change)]">
          {shop.categories.slice(0, 6).map((c) => (
            <PropIcon key={c} id={c} size={18} />
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-brain-change)]">
          {shop.city}, {shop.country}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <h3 className="font-display text-lg font-bold leading-tight text-[var(--color-fg)]">{shop.name}</h3>
          {shop.verified && (
            <span
              title="Verified against the shop's own website"
              className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500"
            >
              <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {(bucket === "physical" || bucket === "hybrid") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-300">
              <Store size={10} /> Physical
            </span>
          )}
          {(bucket === "online" || bucket === "hybrid") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
              <Globe size={10} /> Online
            </span>
          )}
          {shop.shipsWorldwide && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              Ships worldwide
            </span>
          )}
        </div>

        {shop.notes && (
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] line-clamp-3">{shop.notes}</p>
        )}

        {shop.address && (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-[var(--color-muted)]">
            <MapPin size={12} className="mt-0.5 flex-shrink-0" />
            {shop.address}
          </p>
        )}

        {shop.brands.length > 0 && (
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            <span className="text-[var(--color-fg)]/70">Brands:</span> {shop.brands.slice(0, 4).join(", ")}
            {shop.brands.length > 4 && ` +${shop.brands.length - 4}`}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {shop.website && (
            <a
              href={shop.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-brain-change)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
            >
              <ExternalLink size={12} /> Website
            </a>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              shop.address ? `${shop.name} ${shop.address}` : `${shop.name} ${shop.city} ${shop.country}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-fg)] hover:bg-[var(--color-bg-elevated)]"
          >
            <Navigation size={12} /> Map
          </a>
          <a
            href={`${EDIT_SHOP}&title=${encodeURIComponent(`Update: ${shop.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-fg)]"
          >
            <Edit3 size={12} /> Suggest edit
          </a>
        </div>

        {/* Reviews: only real, community-submitted content renders here */}
        <div className="mt-3 border-t border-[var(--color-border)] pt-3">
          {shop.reviews.length > 0 ? (
            <div className="space-y-2">
              {shop.reviews.slice(0, 2).map((r, i) => (
                <div key={i} className="text-xs">
                  <span className="inline-flex items-center gap-1">
                    <span className="font-medium text-[var(--color-fg)]">{r.author}</span>
                    <span className="inline-flex">
                      {Array.from({ length: Math.round(r.rating) }).map((_, j) => (
                        <Star key={j} size={10} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </span>
                  </span>
                  <p className="text-[var(--color-muted)] line-clamp-2">{r.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--color-muted)]">
              No reviews yet.{" "}
              <a
                href={`${EDIT_SHOP}&title=${encodeURIComponent(`Review: ${shop.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-brain-change)] hover:underline"
              >
                Be the first
              </a>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ShopDirectory({ shops }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [types, setTypes] = useState<ShopBucket[]>([]);
  const [ships, setShips] = useState<("yes" | "no")[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [sort, setSort] = useState<"name" | "country" | "physical">("name");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFilters, setMobileFilters] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Counts over the full dataset (stable availability numbers)
  const counts = useMemo(() => {
    const type: Record<string, number> = { physical: 0, online: 0, hybrid: 0 };
    const ship = { yes: 0, no: 0 };
    const cat: Record<string, number> = {};
    const brand: Record<string, number> = {};
    shops.forEach((s) => {
      const b = shopBucket(s);
      if (b in type) type[b]++;
      if (s.shipsWorldwide === true) ship.yes++;
      else if (s.shipsWorldwide === false) ship.no++;
      s.categories.forEach((c) => (cat[c] = (cat[c] || 0) + 1));
      s.brands.forEach((br) => (brand[br] = (brand[br] || 0) + 1));
    });
    return { type, ship, cat, brand };
  }, [shops]);

  const brandList = useMemo(
    () => Object.entries(counts.brand).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    [counts.brand],
  );
  const activeCategories = useMemo(() => CATEGORY_META.filter((c) => counts.cat[c.id] > 0), [counts.cat]);

  const filtered = useMemo(() => {
    const out = shops.filter((s) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hit =
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.brands.some((b) => b.toLowerCase().includes(q));
        if (!hit) return false;
      }
      if (types.length > 0 && !types.includes(shopBucket(s))) return false;
      if (ships.length > 0) {
        const yes = ships.includes("yes") && s.shipsWorldwide === true;
        const no = ships.includes("no") && s.shipsWorldwide === false;
        if (!yes && !no) return false;
      }
      if (categories.length > 0 && !categories.some((c) => s.categories.includes(c))) return false;
      if (brands.length > 0 && !brands.some((b) => s.brands.includes(b))) return false;
      return true;
    });
    return [...out].sort((a, b) => {
      if (sort === "country") return a.country.localeCompare(b.country) || a.name.localeCompare(b.name);
      if (sort === "physical") {
        const av = a.physicalStore ? 0 : 1;
        const bv = b.physicalStore ? 0 : 1;
        return av - bv || a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
  }, [shops, searchQuery, types, ships, categories, brands, sort]);

  const toggle = <T,>(arr: T[], set: (v: T[]) => void, v: T) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const activeCount = types.length + ships.length + categories.length + brands.length + (searchQuery ? 1 : 0);
  const clearAll = () => {
    setSearchQuery("");
    setTypes([]);
    setShips([]);
    setCategories([]);
    setBrands([]);
  };

  const sidebar = (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          type="text"
          placeholder="Search shops..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-brain-change)] focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Filters</span>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-[var(--color-brain-change)] hover:underline">
            Clear all
          </button>
        )}
      </div>

      <FilterGroup title="Shop type">
        <CheckRow label="Physical only" count={counts.type.physical} checked={types.includes("physical")} onChange={() => toggle(types, setTypes, "physical")} />
        <CheckRow label="Online only" count={counts.type.online} checked={types.includes("online")} onChange={() => toggle(types, setTypes, "online")} />
        <CheckRow label="Hybrid (both)" count={counts.type.hybrid} checked={types.includes("hybrid")} onChange={() => toggle(types, setTypes, "hybrid")} />
      </FilterGroup>

      <FilterGroup title="Ships worldwide">
        <CheckRow label="Yes" count={counts.ship.yes} checked={ships.includes("yes")} onChange={() => toggle(ships, setShips, "yes")} />
        <CheckRow label="No" count={counts.ship.no} checked={ships.includes("no")} onChange={() => toggle(ships, setShips, "no")} />
      </FilterGroup>

      <FilterGroup title="Specialties">
        {activeCategories.map((c) => (
          <CheckRow
            key={c.id}
            label={c.label}
            iconNode={<PropIcon id={c.id} size={15} />}
            count={counts.cat[c.id]}
            checked={categories.includes(c.id)}
            onChange={() => toggle(categories, setCategories, c.id)}
          />
        ))}
      </FilterGroup>

      {brandList.length > 0 && (
        <FilterGroup title="Brands carried" defaultOpen={false}>
          {(showAllBrands ? brandList : brandList.slice(0, 8)).map(([b, n]) => (
            <CheckRow key={b} label={b} count={n} checked={brands.includes(b)} onChange={() => toggle(brands, setBrands, b)} />
          ))}
          {brandList.length > 8 && (
            <button
              onClick={() => setShowAllBrands(!showAllBrands)}
              className="px-2 pt-1 text-xs text-[var(--color-brain-change)] hover:underline"
            >
              {showAllBrands ? "Show fewer" : `Show all ${brandList.length}`}
            </button>
          )}
        </FilterGroup>
      )}
    </div>
  );

  const contribute = (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        <div className="flex items-center gap-2">
          <Github size={18} className="text-[var(--color-fg)]" />
          <h3 className="font-display text-base font-bold text-[var(--color-fg)]">Contribute</h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
          This directory is open source and maintained by the juggling community on GitHub. Know a shop we're
          missing, or spotted something wrong?
        </p>
        <div className="mt-4 space-y-2">
          <a
            href={ADD_SHOP}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brain-change)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <PlusCircle size={15} /> Add a shop
          </a>
          <a
            href={EDIT_SHOP}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-fg)] hover:bg-[var(--color-bg-elevated)]"
          >
            <Edit3 size={15} /> Suggest an edit or review
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brain-change)]">How to contribute</h4>
        <ol className="mt-3 space-y-3">
          {[
            "Open an issue with our template - all you need is a free GitHub account, no code required.",
            "We verify the shop against its own website and public reseller / manufacturer lists.",
            "Once checked, it's added or updated in the open data - live for everyone.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-[var(--color-muted)]">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-brain-change)]/20 text-xs font-bold text-[var(--color-brain-change)]">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <a
          href={`${REPO}/tree/main/src/content/location`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-brain-change)] hover:underline"
        >
          View the shop data on GitHub <ExternalLink size={13} />
        </a>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">How we verify</h4>
        </div>
        <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-muted)]">
          <li>The shop's official website</li>
          <li>Public reseller &amp; manufacturer lists</li>
          <li>Community submissions</li>
        </ul>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          We link out to Google Maps for location and reviews rather than copying their data.
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Filters (lg+) */}
        <aside className="hidden lg:block lg:w-56 lg:flex-shrink-0 xl:w-60">
          <div className="sticky top-24">{sidebar}</div>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilters(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-fg)] hover:bg-[var(--color-bg-elevated)] lg:hidden"
              >
                <Search size={15} /> Filters
                {activeCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brain-change)] text-xs text-white">
                    {activeCount}
                  </span>
                )}
              </button>
              <p className="text-sm text-[var(--color-muted)]">
                <span className="font-semibold text-[var(--color-fg)]">{filtered.length}</span> of {shops.length} shops
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="hidden text-xs text-[var(--color-muted)] sm:block">Sort</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2.5 py-1.5 text-xs text-[var(--color-fg)] focus:border-[var(--color-brain-change)] focus:outline-none"
              >
                <option value="name">Name (A-Z)</option>
                <option value="country">Country</option>
                <option value="physical">Physical stores first</option>
              </select>
              <div className="flex overflow-hidden rounded-lg border border-[var(--color-border)]">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  className={`p-1.5 ${view === "grid" ? "bg-[var(--color-brain-change)] text-white" : "text-[var(--color-muted)] hover:bg-[var(--color-bg-elevated)]"}`}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="List view"
                  className={`p-1.5 ${view === "list" ? "bg-[var(--color-brain-change)] text-white" : "text-[var(--color-muted)] hover:bg-[var(--color-bg-elevated)]"}`}
                >
                  <ListIcon size={15} />
                </button>
              </div>
            </div>
          </div>

          {activeCount > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {[...types, ...ships, ...categories, ...brands].map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brain-change)]/15 px-2.5 py-1 text-xs text-[var(--color-brain-change)]"
                >
                  {CATEGORY_LABEL[v] || v}
                  <button
                    aria-label={`Remove ${v} filter`}
                    onClick={() => {
                      setTypes(types.filter((x) => x !== v));
                      setShips(ships.filter((x) => (x as string) !== v));
                      setCategories(categories.filter((x) => x !== v));
                      setBrands(brands.filter((x) => x !== v));
                    }}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {filtered.length > 0 ? (
            <div className={view === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3" : "grid grid-cols-1 gap-4"}>
              {filtered.map((s) => (
                <ShopCard key={s.id} shop={s} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] p-12 text-center">
              <p className="text-lg font-semibold text-[var(--color-fg)]">No shops match those filters</p>
              <button onClick={clearAll} className="mt-3 text-sm text-[var(--color-brain-change)] hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Contribute (xl+) */}
        <aside className="hidden xl:block xl:w-72 xl:flex-shrink-0">
          <div className="sticky top-24">{contribute}</div>
        </aside>
      </div>

      {/* Contribute below results on < xl */}
      <div className="mt-6 xl:hidden">{contribute}</div>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFilters(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-[var(--color-bg)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-[var(--color-fg)]">Filters</span>
              <button onClick={() => setMobileFilters(false)} className="text-[var(--color-muted)] hover:text-[var(--color-fg)]">
                <X size={20} />
              </button>
            </div>
            {sidebar}
            <button
              onClick={() => setMobileFilters(false)}
              className="mt-5 w-full rounded-lg bg-[var(--color-brain-change)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Show {filtered.length} shops
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
