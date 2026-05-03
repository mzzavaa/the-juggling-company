import { getCollection, type CollectionEntry } from "astro:content";

/**
 * Centralised content queries. Pages call these instead of touching getCollection
 * directly so filters (e.g. drop drafts in production) stay consistent.
 */

const isProd = import.meta.env.PROD;

const notDraft = <T extends { data: { draft?: boolean } }>(entry: T): boolean =>
  !isProd || !entry.data.draft;

export async function getIdeas(): Promise<CollectionEntry<"idea">[]> {
  const entries = await getCollection("idea", notDraft);
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getVideos(): Promise<CollectionEntry<"video">[]> {
  const entries = await getCollection("video");
  return entries.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export async function getFeaturedVideos(limit = 3): Promise<CollectionEntry<"video">[]> {
  const entries = await getVideos();
  const featured = entries.filter((e) => e.data.featured);
  return (featured.length > 0 ? featured : entries).slice(0, limit);
}

export async function getTalks(): Promise<{
  upcoming: CollectionEntry<"talk">[];
  past: CollectionEntry<"talk">[];
}> {
  const entries = await getCollection("talk");
  const now = Date.now();
  const sortedAsc = [...entries].sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
  const sortedDesc = [...entries].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return {
    upcoming: sortedAsc.filter((t) => t.data.upcoming || t.data.date.getTime() >= now),
    past: sortedDesc.filter((t) => !t.data.upcoming && t.data.date.getTime() < now),
  };
}

export async function getServices(): Promise<CollectionEntry<"service">[]> {
  const entries = await getCollection("service");
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getProducts(): Promise<CollectionEntry<"product">[]> {
  const entries = await getCollection("product");
  return entries.sort((a, b) => a.data.title.localeCompare(b.data.title));
}

export async function getLocations(): Promise<CollectionEntry<"location">[]> {
  return getCollection("location");
}

export async function getPress(): Promise<CollectionEntry<"press">[]> {
  const entries = await getCollection("press");
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getPosts(): Promise<CollectionEntry<"post">[]> {
  const entries = await getCollection("post", notDraft);
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getLatestPosts(limit = 2): Promise<CollectionEntry<"post">[]> {
  const entries = await getPosts();
  return entries.slice(0, limit);
}

/** Aggregated tag counts across a collection — used by filter chips. */
export function tagCounts<T extends { data: { tags: string[] } }>(
  entries: readonly T[],
): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of entries) {
    for (const tag of e.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
