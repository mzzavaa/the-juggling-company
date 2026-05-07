#!/usr/bin/env node
// Generates real poster images for every video card.
// - YouTube: tries maxresdefault.jpg, falls back to hqdefault.jpg
// - TikTok: fetches the oEmbed thumbnail_url and downloads it
// - Instagram: extracts a frame from a thematically-matched local video via ffmpeg
//
// Output: public/posters/<slug>.jpg
// Run with: node scripts/generate-video-posters.mjs

import { readdir, readFile, writeFile, mkdir, access } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const VIDEO_DIR = join(ROOT, "src/content/video");
const POSTER_DIR = join(ROOT, "public/posters");
const LOCAL_VIDEO_DIR = join(ROOT, "public/videos");

// Frame from a thematically-matched local video for each Instagram entry.
// Picked from public/videos/. Instagram blocks anonymous thumbnail fetches.
const INSTAGRAM_POSTER_SOURCES = {
  "instagram-aws-developers-juggling": "aws-community-builder-desk.mp4",
  "instagram-juggling-post": "linda-four-balls-smile.mp4",
  "instagram-reel-cderda": "linda-three-balls-joy.mp4",
  "instagram-reel-cjwbxv": "linda-holds-two-balls.mp4",
  "instagram-reel-dttqfcygoxu": "linda-four-balls-outstretched.mp4",
  "instagram-reel-dx2m7kuixdj": "juggling-balls-in-grass.mp4",
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    let [, k, v] = m;
    v = v.trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    data[k] = v;
  }
  return data;
}

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Referer: "https://www.tiktok.com/" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function runFfmpeg(args) {
  return new Promise((res, rej) => {
    const p = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d.toString()));
    p.on("close", (code) => (code === 0 ? res() : rej(new Error(err.split("\n").slice(-3).join("\n")))));
  });
}

async function downloadYoutube(slug, externalId) {
  const tries = [
    `https://i.ytimg.com/vi/${externalId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${externalId}/hqdefault.jpg`,
  ];
  for (const url of tries) {
    try {
      const buf = await fetchBuffer(url);
      // YouTube returns a 120x90 placeholder when maxres doesn't exist; reject tiny payloads.
      if (buf.length < 6000) continue;
      await writeFile(join(POSTER_DIR, `${slug}.jpg`), buf);
      return url;
    } catch {
      /* try next */
    }
  }
  throw new Error(`No YouTube thumbnail found for ${slug}`);
}

async function downloadTikTok(slug, externalUrl) {
  const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(externalUrl)}`;
  const data = await fetchJson(oembedUrl);
  if (!data.thumbnail_url) throw new Error(`No thumbnail_url in oEmbed for ${slug}`);
  const buf = await fetchBuffer(data.thumbnail_url);
  await writeFile(join(POSTER_DIR, `${slug}.jpg`), buf);
  return data.thumbnail_url;
}

async function extractInstagramFrame(slug) {
  const sourceVideo = INSTAGRAM_POSTER_SOURCES[slug];
  if (!sourceVideo) throw new Error(`No INSTAGRAM_POSTER_SOURCES entry for ${slug}`);
  const src = join(LOCAL_VIDEO_DIR, sourceVideo);
  if (!(await exists(src))) throw new Error(`Source video missing: ${src}`);
  const out = join(POSTER_DIR, `${slug}.jpg`);
  // Grab a frame ~1.2s in to avoid black intro frames; quality 3 (high).
  await runFfmpeg([
    "-y",
    "-ss", "1.2",
    "-i", src,
    "-frames:v", "1",
    "-q:v", "3",
    "-vf", "scale=720:-2",
    out,
  ]);
  return `local:${sourceVideo}`;
}

async function main() {
  await mkdir(POSTER_DIR, { recursive: true });
  const files = (await readdir(VIDEO_DIR)).filter((f) => f.endsWith(".md"));

  const results = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const fm = parseFrontmatter(await readFile(join(VIDEO_DIR, file), "utf8"));
    if (!fm) {
      results.push({ slug, status: "skip", reason: "no frontmatter" });
      continue;
    }
    const out = join(POSTER_DIR, `${slug}.jpg`);
    if ((await exists(out)) && !process.env.FORCE) {
      results.push({ slug, status: "exists" });
      continue;
    }
    try {
      let info;
      if (fm.source === "youtube") info = await downloadYoutube(slug, fm.externalId);
      else if (fm.source === "tiktok") info = await downloadTikTok(slug, fm.externalUrl);
      else if (fm.source === "instagram") info = await extractInstagramFrame(slug);
      else throw new Error(`Unknown source: ${fm.source}`);
      results.push({ slug, status: "ok", info });
      console.log(`  + ${slug}`);
    } catch (e) {
      results.push({ slug, status: "fail", reason: e.message });
      console.warn(`  ! ${slug}: ${e.message}`);
    }
  }

  const ok = results.filter((r) => r.status === "ok").length;
  const cached = results.filter((r) => r.status === "exists").length;
  const fail = results.filter((r) => r.status === "fail");
  console.log(`\nDone. ${ok} new, ${cached} cached, ${fail.length} failed.`);
  if (fail.length) {
    console.log("Failures:");
    fail.forEach((f) => console.log(`  - ${f.slug}: ${f.reason}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
