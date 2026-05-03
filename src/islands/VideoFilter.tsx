import { useMemo, useState } from "react";

/**
 * Client-side filter island for the Videos page.
 * Receives an already-serialized list of video summaries from Astro.
 */

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
  ideaSlugs: string[];
  description: string;
}

interface Props {
  videos: VideoSummary[];
  ideaTitlesBySlug: Record<string, string>;
}

const ALL = "__all__" as const;
type FilterValue = string;

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return s === 0 ? `${m}m` : `${m}:${String(s).padStart(2, "0")}`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

const sourceLabel: Record<VideoSummary["source"], string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
};

export default function VideoFilter({ videos, ideaTitlesBySlug }: Props) {
  const [source, setSource] = useState<FilterValue>(ALL);
  const [tag, setTag] = useState<FilterValue>(ALL);
  const [idea, setIdea] = useState<FilterValue>(ALL);
  const [year, setYear] = useState<FilterValue>(ALL);

  const tagOptions = useMemo(() => uniqueSorted(videos.flatMap((v) => v.tags)), [videos]);
  const ideaOptions = useMemo(() => uniqueSorted(videos.flatMap((v) => v.ideaSlugs)), [videos]);
  const yearOptions = useMemo(
    () =>
      uniqueSorted(videos.map((v) => new Date(v.publishedAt).getFullYear().toString())).reverse(),
    [videos],
  );
  const sourceOptions = useMemo(() => uniqueSorted(videos.map((v) => v.source)), [videos]);

  const filtered = videos.filter(
    (v) =>
      (source === ALL || v.source === source) &&
      (tag === ALL || v.tags.includes(tag)) &&
      (idea === ALL || v.ideaSlugs.includes(idea)) &&
      (year === ALL || new Date(v.publishedAt).getFullYear().toString() === year),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <ChipGroup
          label="Source"
          value={source}
          onChange={setSource}
          options={sourceOptions.map((s) => ({ value: s, label: sourceLabel[s as VideoSummary["source"]] }))}
        />
        {tagOptions.length > 0 && (
          <ChipGroup
            label="Tag"
            value={tag}
            onChange={setTag}
            options={tagOptions.map((t) => ({ value: t, label: t }))}
          />
        )}
        {ideaOptions.length > 0 && (
          <ChipGroup
            label="Idea"
            value={idea}
            onChange={setIdea}
            options={ideaOptions.map((i) => ({
              value: i,
              label: ideaTitlesBySlug[i] ?? i,
            }))}
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

      <p className="text-sm text-[var(--color-muted)]">
        Showing {filtered.length} of {videos.length} videos.
      </p>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v) => (
          <li key={v.slug}>
            <a
              href={`/videos/${v.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] transition hover:border-[var(--color-accent)]"
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
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="font-display text-lg font-semibold leading-snug text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">
                  {v.title}
                </h3>
                {v.tags.length > 0 && (
                  <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                    {v.tags.map((t) => (
                      <li
                        key={t}
                        className="rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-xs text-[var(--color-muted)]"
                      >
                        #{t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function uniqueSorted(arr: string[]): string[] {
  return [...new Set(arr)].sort();
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
          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-fg)] hover:border-[var(--color-accent)]")
      }
    >
      {children}
    </button>
  );
}
