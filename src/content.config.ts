import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "slug must be kebab-case");

const isoDate = z.coerce.date();

const pillar = z.enum(["brain", "tech", "change"]);

const idea = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/idea" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug,
      summary: z.string(),
      hero: image().optional(),
      heroAlt: z.string().optional(),
      order: z.number().int().nonnegative().default(0),
      tags: z.array(z.string()).default([]),
      pillars: z.array(pillar).min(1),
      updatedAt: isoDate,
      draft: z.boolean().default(false),
      related: z.array(reference("idea")).default([]),
    }),
});

const video = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,yaml,yml}", base: "./src/content/video" }),
  schema: z.object({
    title: z.string(),
    slug,
    source: z.enum(["youtube", "tiktok", "instagram"]),
    externalId: z.string(),
    externalUrl: z.string().url(),
    publishedAt: isoDate,
    durationSec: z.number().int().positive(),
    tags: z.array(z.string()).default([]),
    pillars: z.array(pillar).default([]),
    description: z.string().default(""),
    locationSlug: reference("location").optional(),
    ideaSlugs: z.array(reference("idea")).default([]),
    featured: z.boolean().default(false),
  }),
});

const talk = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,yaml,yml}", base: "./src/content/talk" }),
  schema: z.object({
    title: z.string(),
    slug,
    date: isoDate,
    venue: z.string(),
    city: z.string(),
    country: z.string(),
    abstract: z.string(),
    slidesUrl: z.string().url().optional(),
    recordingUrl: z.string().url().optional(),
    locationSlug: reference("location").optional(),
    pillars: z.array(pillar).default([]),
    upcoming: z.boolean().default(false),
  }),
});

const priceModel = z.enum(["inquire", "fixed", "tiered"]);

const service = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/service" }),
  schema: z.object({
    title: z.string(),
    slug,
    summary: z.string(),
    audience: z.string(),
    whatsIncluded: z.array(z.string()).min(1),
    formats: z.array(z.string()).min(1),
    priceModel,
    ctaUrl: z.string(),
    order: z.number().int().nonnegative().default(0),
  }),
});

const product = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,yaml,yml}", base: "./src/content/product" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug,
      summary: z.string(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      priceCents: z.number().int().nonnegative().optional(),
      externalUrl: z.string().url(),
      category: z.string(),
      inStock: z.boolean().default(true),
    }),
});

const locationType = z.enum(["past-performance", "home-base", "available", "workshop"]);

const location = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,yaml,yml}", base: "./src/content/location" }),
  schema: z.object({
    name: z.string(),
    slug,
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    country: z.string(),
    city: z.string(),
    type: locationType,
    notes: z.string().default(""),
    photos: z.array(z.string()).default([]),
  }),
});

const press = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,yaml,yml}", base: "./src/content/press" }),
  schema: z.object({
    outlet: z.string(),
    title: z.string(),
    url: z.string().url(),
    date: isoDate,
    excerpt: z.string(),
    logo: z.string().optional(),
  }),
});

const post = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/post" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug,
      summary: z.string(),
      date: isoDate,
      tags: z.array(z.string()).default([]),
      pillars: z.array(pillar).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { idea, video, talk, service, product, location, press, post };
