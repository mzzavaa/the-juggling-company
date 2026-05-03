import { useMemo, useState } from "react";

/**
 * Client-side filter island for the Videos page.
 * Receives an already-serialized list of video summaries from Astro.
 */

export type Pillar = "brain" | "tech" | "change";

export interface VideoSummary {
  slug: string;
  title: string;
  source: "youtube" | "tiktok" | "instagram";
  externalUrl: string;
  externalId: string;
  thumbUrl: string;
  publishedAt: string; // ISO
  durationSec: number;
  tags: string[];
  pillars: Pillar[];
  ideaSlugs: string[];
  description: string;
}

interface Props {
  videos: VideoSummary[];
  /** Reserved for future "filter by idea" UI; currently unused. */
  ideaTitlesBySlug?: Record<string, string>;
}

const ALL = "__all__" as const;
type FilterValue = string;

const PILLAR_HEX: Record<Pillar | string, string> = {
  brain: "#ff3366",
  tech: "#33cc66",
  change: "#3b6cff",
};

const PILLAR_LABEL: Record<Pillar | string, string> = {
  brain: "Brain",
  tech: "Tech",
  change: "Change",
};

const sourceLabel: Record<VideoSummary["source"], string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
};

function blendHex(pillars: Pillar[]): string {
  const set = new Set(pillars);
  if (set.size >= 3) return "#f4f4f0";
  if (set.size === 0) return "#9696b0";
  if (set.size === 1) return PILLAR_HEX[[...set][0]];
  if (set.has("brain") && set.has("tech")) return "#ffcc33";
  if (set.has("brain") && set.has("change")) return "#cc33ff";
  return "#33ccff";
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return s === 0 ? `${m}m` : `${m}:${String(s).padStart(2, "0")}`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export default function VideoFilter({ videos }: Props) {
  const [pillar, setPillar] = useState<FilterValue>(ALL);
  const [source, setSource] = useState<FilterValue>(ALL);
  const [tag, setTag] = useState<FilterValue>(ALL);
  const [year, setYear] = useState<FilterValue>(ALL);

  const tagOptions = useMemo(() => uniqueSorted(videos.flatMap((v) => v.tags)), [videos]);
  const yearOptions = useMemo(
    () =>
      uniqueSorted(videos.map((v) => new Date(v.publishedAt).getFullYear().toString())).reverse(),
    [videos],
  );
  const sourceOptions = useMemo(() => uniqueSorted(videos.map((v) => v.source)), [videos]);
  const pillarOptions: Pillar[] = ["brain", "tech", "change"];

  const filtered = videos.filter(
    (v) =>
      (pillar === ALL || v.pillars.includes(pillar as Pillar)) &&
      (source === ALL || v.source === source) &&
      (tag === ALL || v.tags.includes(tag)) &&
      (year === ALL || new Date(v.publishedAt).getFullYear().toString() === year),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        <PillarChipGroup
          value={pillar}
          onChange={setPillar}
          options={pillarOptions}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <ChipGroup
            label="Source"
            value={source}
            onChange={setSource}
            options={sourceOptions.map((s) => ({
              value: s,
              label: sourceLabel[s as VideoSummary["source"]],
            }))}
          />
          {tagOptions.length > 0 && (
            <ChipGroup
              label="Tag"
              value={tag}
              onChange={setTag}
              options={tagOptions.map((t) => ({ value: t, label: t }))}
            />
          )}
          {yearOptions.length > 0 && (
            <ChipGroup
              label="Year"
              value={year}
              onChange={setYear}
              options={yearOptions.map((y) => ({ value: y, label: y }))}
            />
          )}
        </div>
      </div>

      <p className="text-sm text-[var(--color-muted)]">
        Showing {filtered.length} of {videos.length} videos.
      </p>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v) => {
          const accent = blendHex(v.pillars);
          return (
            <li key={v.slug}>
              <a
                href={`/videos/${v.slug}`}
                className="card group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] transition"
                style={{ ["--card-accent" as string]: accent }}
              >
                <div className="relative aspect-video overflow-hidden bg-black">
                  <img
                    src={v.thumbUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                    {sourceLabel[v.source]}
                  </span>
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                    {formatDuration(v.durationSec)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  {v.pillars.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {v.pillars.map((p) => (
                        <span
                          key={p}
                          className="rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
                          style={{ backgroundColor: PILLAR_HEX[p], color: "#0a0a12" }}
                        >
                          {PILLAR_LABEL[p]}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="font-display text-lg font-semibold leading-snug text-[var(--color-fg)]">
                    {v.title}
                  </h3>
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      <style>{`
        .card { transition: border-color 200ms ease, box-shadow 220ms ease, transform 220ms ease; }
        .card:hover {
          border-color: var(--card-accent);
          box-shadow: 0 0 0 1px color-mix(in oklab, var(--card-accent) 30%, transparent),
                      0 12px 36px -12px color-mix(in oklab, var(--card-accent) 60%, transparent);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

function uniqueSorted(arr: string[]): string[] {
  return [...new Set(arr)].sort();
}

function PillarChipGroup({
  value,
  onChange,
  options,
}: {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
  options: Pillar[];
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="mr-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
        Pillar
      </legend>
      <button
        type="button"
        onClick={() => onChange(ALL)}
        aria-pressed={value === ALL}
        className={
          "rounded-full border px-3 py-1 text-sm transition " +
          (value === ALL
            ? "border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-bg)]"
            : "border-[var(--color-border)] bg-transparent text-[var(--color-fg)] hover:border-[var(--color-fg)]")
        }
      >
        All
      </button>
      {options.map((p) => {
        const selected = value === p;
        const hex = PILLAR_HEX[p];
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-pressed={selected}
            className="rounded-full border px-3 py-1 text-sm font-semibold uppercase tracking-wide transition"
            style={{
              borderColor: hex,
              backgroundColor: selected ? hex : "transparent",
              color: selected ? "#0a0a12" : hex,
            }}
          >
            {PILLAR_LABEL[p]}
          </button>
        );
      })}
    </fieldset>
  );
}

function ChipGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: FilterValue;
  onChange: (v: FilterValue) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="mr-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
        {label}
      </legend>
      <Chip selected={value === ALL} onClick={() => onChange(ALL)}>
        All
      </Chip>
      {options.map((opt) => (
        <Chip key={opt.value} selected={value === opt.value} onClick={() => onChange(opt.value)}>
          {opt.label}
        </Chip>
      ))}
    </fieldset>
  );
}

function Chip({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        "rounded-full border px-3 py-1 text-sm transition " +
        (selected
          ? "border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-bg)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-fg)] hover:border-[var(--color-fg)]")
      }
    >
      {children}
    </button>
  );
}
